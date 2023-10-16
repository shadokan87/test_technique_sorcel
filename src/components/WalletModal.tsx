import { Alchemy, OwnedNft, OwnedNftsResponse } from 'alchemy-sdk';
import { Button, Flex, Modal, ModalProps, Typography } from 'antd';
import Card from 'antd/es/card/Card';
import Meta from 'antd/es/card/Meta';
import { Footer } from 'antd/es/layout/layout';
import React, { useEffect, useMemo, useState } from 'react';
export interface WalletModalProps extends Omit<ModalProps, 'footer'> {
  wallet: string;
  alchemy: Alchemy;
}
export const WalletModal = ({
  wallet,
  alchemy,
  ...modalProps
}: WalletModalProps) => {
  const footer: ModalProps['footer'] = (
    <Flex align='center' justify='center'>
      <Button onClick={modalProps.onCancel}>{'close'}</Button>
    </Flex>
  );
  const props: ModalProps = { footer, width: '100vw', ...modalProps };
  const [nfts, setNfts] = useState<OwnedNftsResponse | undefined>(undefined);
  useEffect(() => {
    const fetchNfts = async () => {
      try {
        const result = await alchemy.nft.getNftsForOwner(wallet);
        setNfts(result);
      } catch (e) {
        alert('error');
      }
    };
    if (alchemy) fetchNfts();
  }, [alchemy, wallet]);
  const onwedNfts: OwnedNftsResponse['ownedNfts'] | undefined = useMemo(
    () => nfts?.ownedNfts,
    [nfts],
  );
  useEffect(() => {
    console.log(onwedNfts);
  }, [onwedNfts]);

  const getNftThumbnail = (nft: OwnedNft) => {
    if (!nft.media.length) return nft.rawMetadata.image;
    return nft.media[0].thumbnail;
  };
  return (
    <Modal {...props}>
      {/* <Typography>{'test'}</Typography> */}
      {(onwedNfts && (
        <Flex wrap='wrap' justify='center' gap={'0.5em'}>
          {onwedNfts.map((nft, index) => (
            <Card
              key={index}
              hoverable
              style={{ width: 240 }}
              cover={<img alt='example' src={getNftThumbnail(nft)} />}
            >
              <Meta title={nft.title} description={nft.description} />
            </Card>
          ))}
        </Flex>
      )) || (
        <>
          <Typography>{'Nothing to show.'}</Typography>
        </>
      )}
    </Modal>
  );
};

export default WalletModal;
