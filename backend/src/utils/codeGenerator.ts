import Referral from '../models/referrals';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 8;

export const generateReferralCode = async (): Promise<string> => {
  let code: string;
  let isUnique = false;

  while (!isUnique) {
    code = Array.from(
      { length: CODE_LENGTH }, 
      () => CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length))
    ).join('');

    // Check if code already exists
    const existingReferral = await Referral.findOne({ code });
    if (!existingReferral) {
      isUnique = true;
    }
  }

  return code!;
};
