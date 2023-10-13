import React, { useEffect, useState } from 'react';
import './Application.scss';
import axios from 'axios';
import { Button, Input, Typography, message } from 'antd';
import { Alchemy, Network } from 'alchemy-sdk';

const ALCHEMY_API_KEY = 'alcht_Rh7Jis6SVA6obxvg5ZCpa2XMUzELLn';

interface payload {
  wallet: string;
  contractAddress: string;
}
const Application: React.FC = () => {
  const [payload, setPayload] = useState({
    wallet: '',
    contractAddress: '',
  });
  const [verify, setVerify] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const alchemy = useState(
    new Alchemy({
      apiKey: ALCHEMY_API_KEY,
      network: Network.ETH_MAINNET,
    }),
  );
  useEffect(() => {
    console.log(payload);
  }, [payload]);
  useEffect(() => {
    if (!verify) return;
    const verifyOwnerShip = async (wallet: string, contractAddress: string) => {
      messageApi.open({
        key: 'updatable',
        type: 'loading',
        content: 'Verifying ownership, please wait...',
      });
      await axios
        .get(
          `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}/isHolderOfCollection`,
          {
            params: {
              wallet,
              contractAddress,
            },
          },
        )
        .then((response) => {
          const { data } = response;
          const type = data.isHolderOfCollection ? 'success' : 'error';
          const content = data.isHolderOfCollection
            ? 'is owner !'
            : 'is not owner';

          messageApi.open({
            key: 'updatable',
            type,
            content,
            duration: 5,
          });
          console.log(response);
        })
        .catch((e) => {
          messageApi.open({
            key: 'updatable',
            type: 'error',
            content: 'Unexpected error, please verify informations format',
            duration: 5,
          });
        });
      setVerify(false);
    };
    verifyOwnerShip(payload.wallet, payload.contractAddress);
  }, [verify]);
  return (
    <>
      {contextHolder}
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
            onClick={() => setVerify(true)}
          >
            Verify ownership
          </Button>
        </section>
      </main>
    </>
  );
};

export default Application;
