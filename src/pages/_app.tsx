import React, { useState, useLayoutEffect, useEffect } from 'react';
import { NextComponentType } from 'next';
import NextApp from 'next/app';
import Head from 'next/head';
import { Web3Provider } from '@ethersproject/providers';
import {
  Web3ReactProvider,
  useWeb3React,
  UnsupportedChainIdError,
} from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import { Global } from '@emotion/core';
import { ColorModeProvider, CSSReset, ThemeProvider } from '@chakra-ui/core';
import 'react-datepicker/dist/react-datepicker.css';
import '../utils/customDatePickerStyles.css';
// import * as serviceWorker from '../serviceWorker';

import { ContractProvider } from '../state/contracts/Context';
import Layout from '../components/Layout';
import Error from '../components/Error';
import SwitchChain from '../components/SwitchChain';
import theme, { GlobalStyle } from '../utils/theme';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function Application({ Component }: { Component: NextComponentType }) {
  const [painted, setPainted] = useState<boolean>(false);
  useIsomorphicLayoutEffect(() => {
    setPainted(true);
  }, []);

  const { error, chainId } = useWeb3React();
  console.log('chainId:', chainId);

  const getErrorMessage = () => {
    if (error instanceof NoEthereumProviderError)
      console.log(
        'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
      );
    else if (error instanceof UnsupportedChainIdError)
      console.log("You're connected to an unsupported network.");
    else if (error instanceof UserRejectedRequestErrorInjected)
      console.log(
        'Please authorize this website to access your Ethereum account.'
      );
    else {
      console.error(error);
      return 'An unknown error occurred. Check the console for more details.';
    }
  };

  return !painted ? null : (
    <Layout>
      {error ? (
        getErrorMessage()
      ) : typeof chainId !== 'number' ? null : chainId !== 42 ? (
        <SwitchChain />
      ) : (
        <Component />
      )}
    </Layout>
  );
}

function getLibrary(provider: any): Web3Provider {
  return new Web3Provider(provider);
}

export default class App extends NextApp {
  render() {
    const { Component } = this.props;

    return (
      <>
        <Head>
          <title key="title">MagicBet</title>
        </Head>
        <Web3ReactProvider getLibrary={getLibrary}>
          <ContractProvider>
            <ThemeProvider theme={theme}>
              <ColorModeProvider>
                <CSSReset />
                <Global styles={GlobalStyle} />
                <Application Component={Component} />
              </ColorModeProvider>
            </ThemeProvider>
          </ContractProvider>
        </Web3ReactProvider>
      </>
    );
  }
}

// serviceWorker.register();
