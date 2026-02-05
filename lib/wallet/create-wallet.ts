import { createClient } from '@/lib/supabase/server';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import crypto from 'crypto';

/**
 * Creates a new wallet for filmmaker, distributor, or platform
 * Uses Ethereum/Base compatible wallet generation
 */
export async function createWalletForUser(
  userId: string,
  userType: 'filmmaker' | 'distributor' | 'platform'
) {
  try {
    console.log('[v0] Creating wallet for:', { userId, userType });

    // Generate new private key
    const privateKey = generatePrivateKey();
    
    // Create account from private key
    const account = privateKeyToAccount(privateKey);
    const walletAddress = account.address;

    console.log('[v0] Generated wallet address:', walletAddress);

    // Encrypt private key before storing
    const encryptedKey = encryptPrivateKey(privateKey);

    // Store in database
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        user_type: userType,
        wallet_address: walletAddress,
        wallet_private_key_encrypted: encryptedKey,
        currency: 'KES',
        supported_stablecoins: ['USDC', 'USDT'],
      })
      .select()
      .single();

    if (error) {
      console.error('[v0] Error creating wallet:', error);
      throw new Error(`Failed to create wallet: ${error.message}`);
    }

    console.log('[v0] Wallet created successfully');
    return {
      walletAddress,
      userId,
      userType,
    };
  } catch (error) {
    console.error('[v0] Error in createWalletForUser:', error);
    throw error;
  }
}

/**
 * Retrieves wallet for a user
 */
export async function getWalletForUser(userId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('[v0] Error fetching wallet:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[v0] Error in getWalletForUser:', error);
    return null;
  }
}

/**
 * Encrypts private key using AES-256-GCM
 */
function encryptPrivateKey(privateKey: string): string {
  const encryptionKey = process.env.WALLET_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('WALLET_ENCRYPTION_KEY not set');
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(encryptionKey, 'hex'),
    iv
  );

  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts private key
 */
export function decryptPrivateKey(encryptedKey: string): string {
  const encryptionKey = process.env.WALLET_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('WALLET_ENCRYPTION_KEY not set');
  }

  const [ivHex, authTagHex, encrypted] = encryptedKey.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(encryptionKey, 'hex'),
    iv
  );

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Gets platform wallet (creates if doesn't exist)
 */
export async function getPlatformWallet() {
  const wallet = await getWalletForUser('platform');
  if (!wallet) {
    return createWalletForUser('platform', 'platform');
  }
  return wallet;
}
