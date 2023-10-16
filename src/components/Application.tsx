import React, { useCallback, useEffect, useState } from 'react';
import './Application.scss';
import axios from 'axios';
import { Button, Input, Modal, Typography, message } from 'antd';
import WalletModal from './WalletModal';
import { Alchemy, Network } from 'alchemy-sdk';

const ALCHEMY_API_KEY = 'alcht_Rh7Jis6SVA6obxvg5ZCpa2XMUzELLn';

interface verifyOwnerPayload {
  wallet: string;
  contractAddress: string;
}

const isHolderOfCollection = async (
  wallet: string,
  contractAddress: string,
): Promise<Boolean> => {
  const result: boolean = await axios
    .get(
      `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}/isHolderOfCollection`,
      {
        params: {
          wallet,
          contractAddress,
        },
      },
    )
    .then(({ data }) => data.isHolderOfCollection);
  return result;
};

const Application: React.FC = () => {
  const [payload, setPayload] = useState<verifyOwnerPayload>({
    wallet: '',
    contractAddress: '',
  });
  const [verify, setVerify] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [alchemy, setAlchemy] = useState<undefined | Alchemy>(undefined);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const handleVerifyOwnerClick = useCallback(async () => {
    setVerify(true);
    messageApi.open({
      key: 'handleVerifyOwnerClick',
      type: 'loading',
      content: 'Verifying ownership, please wait...',
    });
    try {
      const result = await isHolderOfCollection(
        payload.wallet,
        payload.contractAddress,
      ).then((value) => value);
      if (result) {
        messageApi.destroy('handleVerifyOwnerClick');
        setAlchemy(
          new Alchemy({
            apiKey: ALCHEMY_API_KEY,
            network: Network.ETH_MAINNET,
          }),
        );
        setIsWalletModalOpen(true);
      } else {
        messageApi.open({
          key: 'handleVerifyOwnerClick',
          type: 'error',
          content: `wallet ${payload.wallet} is not the owner.`,
          duration: 5,
        });
      }
    } catch (e) {
      alert('error');
    }
    setVerify(false);
  }, [JSON.stringify(payload)]);
  const WalletModalOnCancel = () => {
    setIsWalletModalOpen(false);
  };
  return (
    <>
      {contextHolder}
      <WalletModal
        wallet={payload.wallet}
        alchemy={alchemy}
        title={`wallet ${payload.wallet}`}
        open={isWalletModalOpen}
        onCancel={WalletModalOnCancel}
      />
      <main className='main'>
        <section className='input-section-flex'>
          <Typography>{'Verify NFT ownership'}</Typography>
          <Input
            placeholder='wallet'
            onChange={(e) =>
              setPayload((prev) => {
                return { ...prev, wallet: e.target.value };
              })
            }
          ></Input>
          <Input
            placeholder='Contract Address'
            onChange={(e) =>
              setPayload((prev) => {
                return { ...prev, contractAddress: e.target.value };
              })
            }
          ></Input>
          <Button
            disabled={!payload.contractAddress.length || !payload.wallet.length}
            onClick={() => handleVerifyOwnerClick()}
          >
            Verify ownership
          </Button>
        </section>
      </main>
    </>
  );
};

export default Application;
