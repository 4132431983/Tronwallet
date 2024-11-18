import TronWeb from 'tronweb';
import axios from 'axios';

// Replace these with the respective addresses and private keys
const securePrivateKey = 'TRpmwwpaRzKSQKtFeeNWQky8pGxmWBywfP';
const compromisedPrivateKey = 'f1f464c1abb9ad92fa43be889aae5a9f16ca27c9fc79c812e3a6dafe6fec59db';
const destinationWallet = 'TKjUq7ig5ydBDxnHgtPWrWjCTtp71jFbGZ';
const tronApiKey = '67c5b8f3-9347-4ab5-a2c9-29d2dec3069f';
const tronApiHost = 'https://api.trongrid.io';

// Initialize TronWeb instances
const tronWeb = new TronWeb({
  fullHost: tronApiHost,
  privateKey: compromisedPrivateKey,
});

const secureTronWeb = new TronWeb({
  fullHost: tronApiHost,
  privateKey: securePrivateKey,
});

// Function to change permissions of the compromised wallet to the secure wallet
async function changePermissions() {
  try {
    const permissions = [
      {
        type: 'active',
        permissionName: 'owner',
        permissionAddress: secureTronWeb.defaultAddress.base58,  // Secure wallet address
      },
    ];

    // Perform the permission update
    const result = await tronWeb.transactionBuilder.updateAccountPermission(compromisedPrivateKey, permissions);
    
    if (result) {
      console.log('Permissions successfully updated!');
    }
  } catch (error) {
    console.error('Error changing permissions:', error);
  }
}

// Function to send USDT from the compromised wallet to the destination wallet
async function sendUSDT(amount) {
  try {
    const usdtContract = await tronWeb.contract().at('TXX1f3RzFyJpHeTUM7V3djoD72Umvv2Mog');  // USDT contract address on Tron

    // Prepare transaction
    const transaction = await usdtContract.transfer(destinationWallet, amount).send({
      feeLimit: 100000000, // Set an appropriate fee limit
      from: secureTronWeb.defaultAddress.base58, // Use the secure wallet to pay gas
    });

    if (transaction) {
      console.log(`Successfully sent ${amount} USDT to ${destinationWallet}`);
    }
  } catch (error) {
    console.error('Error sending USDT:', error);
  }
}

// Function to revoke all approvals from the compromised wallet (optional)
async function revokeApprovals() {
  try {
    const result = await tronWeb.transactionBuilder.revokeTokenApproval(compromisedPrivateKey);
    
    if (result) {
      console.log('Successfully revoked all approvals from the compromised wallet');
    }
  } catch (error) {
    console.error('Error revoking approvals:', error);
  }
}

// Main function to execute the script
async function main() {
  // First, change permissions to ensure secure wallet has control
  await changePermissions();

  // Then, send USDT to the destination wallet
  const amountToSend = 2300;  // Example amount to send
  await sendUSDT(amountToSend);

  // Optionally, revoke all approvals from the compromised wallet
  await revokeApprovals();
}

// Run the main function
main();