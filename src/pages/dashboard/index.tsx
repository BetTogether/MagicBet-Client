import React, { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import {
  Box,
  Flex,
  Heading,
  Switch,
  Button,
  Icon,
  FormLabel,
  useColorMode,
} from '@chakra-ui/core';

import BTMarketContract from 'abis/BTMarket.json';
import MarketCard from './MarketCard';
import CreateMarket from 'components/Modals/CreateMarket';
import { mintDai } from 'utils';
import { ModalContext } from 'state/modals/Context';
import {
  getMostRecentAddress,
  useFactoryContract,
  useDaiContract,
} from 'hooks/useHelperContract';
import { bgColor, color, bgColorOwnerButtons } from 'theme';

const Dashboard = (): JSX.Element => {
  const { active } = useWeb3React<Web3Provider>();
  const { colorMode } = useColorMode();
  const factoryContract = useFactoryContract();
  const daiContract = useDaiContract();
  const provider = new Web3Provider(window.web3.currentProvider);
  const wallet = provider.getSigner();

  const { modalState, modalDispatch } = useContext(ModalContext);

  //const [checked, setChecked] = useState<boolean>(false);
  const [marketContract, setMarketContract] = useState<Contract>();

  const [newMarketAddress, setNewMarketAddress] = useState<any>();
  if (factoryContract)
    factoryContract.on('MarketCreated', (address: any) =>
      setNewMarketAddress(address)
    );

  useEffect(() => {
    let isExpired = false;
    (async () => {
      if (factoryContract) {
        try {
          const deployedMarkets = await factoryContract.getMarkets();
          if (deployedMarkets.length !== 0) {
            const marketContractAddress = await getMostRecentAddress(
              factoryContract
            );

            const marketInstance = new Contract(
              marketContractAddress,
              BTMarketContract.abi,
              wallet
            );

            setMarketContract(marketInstance);
          }
        } catch (error) {
          console.error(error);
        }
      }
    })();

    return () => {
      isExpired = true;
    };
    //eslint-disable-next-line
  }, [factoryContract]);

  return (
    <>
      <Box bg={bgColor[colorMode]} paddingBottom="1rem">
        <Flex
          marginBottom="-1px"
          justifyContent="space-between"
          alignItems="center"
          padding="1rem 1.5rem"
        >
          <Heading
            as="h3"
            size="lg"
            fontSize="1.5rem"
            font-weight="500"
            color={color[colorMode]}
          >
            Dashboard
          </Heading>

          <Flex justify="center" align="center">
            <FormLabel htmlFor="email-alerts">Enable alerts?</FormLabel>
            <Switch id="email-alerts" color="red" />
          </Flex>
        </Flex>

        <Flex
          flexWrap="wrap"
          flexDirection="column"
          justifyContent="center"
          margin="0 auto 1rem"
          maxWidth="100%"
          padding="0rem 1rem"
        >
          {marketContract ? (
            <MarketCard
              marketContract={marketContract}
              daiContract={daiContract}
            />
          ) : (
            <Button
              bg={bgColorOwnerButtons[colorMode]}
              border="none"
              borderRadius="0.33rem"
              color="light.100"
              text-Align="center"
              fontSize="1rem"
              padding="0.8rem"
              width="auto"
              cursor="pointer"
              _hover={{ bg: 'primary.100' }}
              isDisabled={!active}
              onClick={() =>
                modalDispatch({
                  type: 'TOGGLE_CREATE_MARKET_MODAL',
                  payload: !modalState.createMarketModalIsOpen,
                })
              }
            >
              Create Market
            </Button>
          )}

          {active && (
            <Button
              backgroundColor="primary.100"
              position="fixed"
              bottom="0"
              right="0"
              fontWeight="700"
              color="light.100"
              margin="2rem"
              cursor="pointer"
              padding="0"
              onClick={() => mintDai(wallet)}
            >
              <Icon name="daiIcon" color="white.200" size="1.5rem" />
            </Button>
          )}
        </Flex>
      </Box>
      <CreateMarket isOpen={modalState.createMarketModalIsOpen} />
    </>
  );
};

export default Dashboard;
