import { CardAction, Combatant, DifficultyMode } from '../types';

export function chooseCombatAICard(
  ai: Combatant,
  player: Combatant,
  difficulty: DifficultyMode,
  adaptiveRating: number = 1000
): CardAction | null {
  const affordableCards = ai.hand.filter((c) => c.cost <= ai.energy);
  if (affordableCards.length === 0) return null;

  let effectiveDifficulty = difficulty;
  if (difficulty === 'adaptive') {
    if (adaptiveRating < 1050) effectiveDifficulty = 'easy';
    else if (adaptiveRating < 1300) effectiveDifficulty = 'medium';
    else effectiveDifficulty = 'hard';
  }

  // 1. Check for Lethal blow
  for (const card of affordableCards) {
    const rawDmg = card.damage || 0;
    const effectiveDmg = card.pierce
      ? rawDmg - Math.floor(player.block * 0.5)
      : Math.max(0, rawDmg - player.block);

    if (effectiveDmg >= player.hp) {
      return card;
    }
  }

  // Easy AI: 30% chance to pick any random affordable card, otherwise basic logic
  if (effectiveDifficulty === 'easy' && Math.random() < 0.35) {
    return affordableCards[Math.floor(Math.random() * affordableCards.length)];
  }

  // 2. If AI is low on HP (<35%) and has defense/heal, prioritize defense/heal
  if (ai.hp <= ai.maxHp * 0.35 && ai.block < 10) {
    const defenseCard = affordableCards.find((c) => (c.block || 0) > 0 || (c.heal || 0) > 0);
    if (defenseCard) return defenseCard;
  }

  // 3. Signature card or high value special
  const signatureCard = affordableCards.find((c) => c.isSignature);
  if (signatureCard && Math.random() < 0.8) {
    return signatureCard;
  }

  // 4. Scored evaluation for medium/hard
  const scored = affordableCards.map((card) => {
    let score = 0;

    // Damage value
    if (card.damage) {
      score += card.damage * 1.2;
      if (card.pierce && player.block > 8) score += 6;
    }

    // Block value
    if (card.block) {
      const needDefense = ai.hp < ai.maxHp * 0.6 ? 1.5 : 0.8;
      score += card.block * needDefense;
    }

    // Heal value
    if (card.heal) {
      const missingHp = ai.maxHp - ai.hp;
      if (missingHp > 5) score += card.heal * 2.0;
    }

    // Draw / bonus AP
    if (card.drawCards) score += card.drawCards * 4;
    if (card.bonusAp) score += card.bonusAp * 5;

    // Status effects
    if (card.statusEffect) {
      if (card.statusEffect.type === 'stun') score += 10;
      if (card.statusEffect.type === 'weaken') score += 5;
    }

    // Cost efficiency
    score = score / Math.max(1, card.cost);

    if (effectiveDifficulty === 'medium') {
      score += (Math.random() - 0.5) * 4;
    }

    return { card, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].card;
}
