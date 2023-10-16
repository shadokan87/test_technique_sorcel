import { Alchemy, OwnedNft, OwnedNftsResponse } from 'alchemy-sdk';
import {
  AutoComplete,
  Button,
  Flex,
  Modal,
  ModalProps,
  Typography,
} from 'antd';
import Card from 'antd/es/card/Card';
import Meta from 'antd/es/card/Meta';
import './WalletModal.scss';
import { Footer } from 'antd/es/layout/layout';
import React, { useEffect, useMemo, useState } from 'react';
const lodash = require('lodash');
export interface WalletModalProps extends Omit<ModalProps, 'footer'> {
  wallet: string;
  alchemy: Alchemy;
  onFetchNftFailure: (e: any) => void;
}
export const WalletModal = ({
  wallet,
  alchemy,
  onFetchNftFailure,
  ...modalProps
}: WalletModalProps) => {
  const footer: ModalProps['footer'] = (
    <Flex align='center' justify='center'>
      <Button onClick={modalProps.onCancel}>{'close'}</Button>
    </Flex>
  );
  const props: ModalProps = {
    footer,
    width: '100vw',
    bodyStyle: {
      height: '80vh',
    },
    ...modalProps,
  };
  const [nfts, setNfts] = useState<OwnedNftsResponse | undefined>(undefined);
  useEffect(() => {
    const fetchNfts = async () => {
      try {
        const result = await alchemy.nft.getNftsForOwner(wallet);
        setNfts(result);
      } catch (e) {
        onFetchNftFailure(e);
      }
    };
    if (alchemy) fetchNfts();
  }, [alchemy, wallet]);

  const [searchedValue, setSearchedValue] = useState('');
  const onwedNfts: OwnedNftsResponse['ownedNfts'] | undefined = useMemo(() => {
    if (!nfts) return undefined;
    if (searchedValue.length)
      return nfts?.ownedNfts.filter((nft) =>
        nft.title
          .toLocaleLowerCase()
          .includes(searchedValue.toLocaleLowerCase()),
      );
    return nfts?.ownedNfts;
  }, [nfts, searchedValue]);

  const autoCompleteOptions = useMemo(
    () =>
      lodash.uniqBy(
        onwedNfts?.map((nft) => {
          return { value: nft.title };
        }),
        'value',
      ),
    [onwedNfts],
  );
  const getNftThumbnail = (nft: OwnedNft) => {
    const defaultImage =
      nft.rawMetadata.image ||
      'https://upload.wikimedia.org/wikipedia/commons/4/46/Question_mark_%28black%29.svg';

    if (!nft.media.length) {
      return defaultImage;
    }
    return nft.media[0].thumbnail || defaultImage;
  };
  const handleSearchClear = () => {
    setSearchedValue('');
  };
  return (
    <Modal {...props}>
      {(onwedNfts && (
        <div className='nft-thumbnail-container'>
          <AutoComplete
            value={searchedValue}
            placeholder={'search by title'}
            onChange={(value) => setSearchedValue(value)}
            onSelect={(value) => setSearchedValue(value)}
            options={autoCompleteOptions}
          />
          <Button onClick={handleSearchClear} disabled={!searchedValue.length}>
            {'clear'}
          </Button>
          <Flex wrap='wrap' justify='center' gap={'0.5em'}>
            {onwedNfts.map((nft, index) => (
              <Card
                key={index}
                hoverable
                style={{ width: 240 }}
                cover={<img alt='example' src={getNftThumbnail(nft)} />}
              >
                <Meta
                  key={index}
                  title={nft.title}
                  description={nft.description}
                />
              </Card>
            ))}
          </Flex>
        </div>
      )) || (
        <>
          <Typography>{'Nothing to show.'}</Typography>
        </>
      )}
    </Modal>
  );
};

export default WalletModal;
