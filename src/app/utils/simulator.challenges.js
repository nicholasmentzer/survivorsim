// simulator.challenges.js
import { getRandomInt } from "./simulator.utils";

/** Individual immunity (post-merge) */
export const individualImmunity = (tribe) => {
  const choices = [];
  tribe.forEach((player, i) => {
    for (let j = 0; j < player.postmerge * 4; j++) choices.push(i);
  });
  return choices[getRandomInt(choices.length)];
};

/** Pre-merge tribal immunity between two tribes */
export const tribalImmunity = (tribes) => {
  const total = Math.min(tribes[0].length, tribes[1].length);

  tribes[0].sort((a, b) => b.premerge - a.premerge);
  tribes[1].sort((a, b) => b.premerge - a.premerge);

  let score0 = 0;
  let score1 = 0;
  for (let i = 0; i < total; i++) {
    score0 += tribes[0][i].premerge;
    score1 += tribes[1][i].premerge;
  }

  const choices = [];
  for (let i = 0; i < score0; i++) choices.push(0);
  for (let i = 0; i < score1; i++) choices.push(1);

  return choices[getRandomInt(choices.length)];
};
