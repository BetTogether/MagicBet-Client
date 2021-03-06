import React, { useState, useEffect, useContext } from 'react';
import NextLink from 'next/link';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import {
    Flex,
    Heading,
    Button,
    Icon,
    Link,
    Tag,
    Box,
    IconButton,
    useColorMode,
    Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
    useDisclosure,
} from '@chakra-ui/core';
import { FiSun, FiMoon, FiChevronDown, FiGithub } from 'react-icons/fi';

import { ContractContext } from '../../state/contracts/Context';
import { injected } from '../../utils/connectors';
import { shortenAddress } from '../../utils';
import { bgColor3, bgColor4 } from '../../utils/theme';
import { checkOwner } from '../../utils';

const Header = ({ triedEager }: { triedEager: boolean }): JSX.Element => {
    const { colorMode, toggleColorMode } = useColorMode();
    const { account, activate, connector, error, library } = useWeb3React<Web3Provider>();
    const { contracts } = useContext(ContractContext);

    const [isOwner, setIsOwner] = useState<boolean>(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        if (!!library && !!account) {
            let isStale = false;
            const factoryInstance = contracts[0].connect(library);
            factoryInstance
                .owner()
                .then((owner: string) => {
                    if (!isStale) setIsOwner(checkOwner(account, owner));
                })
                .catch((error: Error) => console.error(error));
            return () => {
                isStale = true;
                setIsOwner(false);
            };
        }
    }, [library, connector, account]);

    return (
        <>
            <Flex
                as="header"
                align="center"
                justify="space-between"
                p="0.75rem 1.25rem"
                color="light.100"
                bg={bgColor3[colorMode]}
                m="0 auto"
            >
                <NextLink href="/dashboard" passHref>
                    <Link href="/dashboard" _hover={{ cursor: 'pointer' }}>
                        <Flex direction="row" align="center" justify="center" mr={5} w="100%">
                            <Box as="span" fontSize="3rem" aria-label="tophat">
                                🎩
                            </Box>
                            <Heading as="h1" size="xl" mx="0.5rem">
                                MagicBet
                            </Heading>
                        </Flex>
                    </Link>
                </NextLink>
                <Flex align="center" justify="flex-end">
                    <Link
                        mr="1rem"
                        href="https://github.com/BetTogether"
                        isExternal
                        aria-label="Github Link"
                        display={{ xs: 'none', md: 'block' }}
                    >
                        <FiGithub size="1.5rem" />
                    </Link>

                    {colorMode === 'dark' ? (
                        <FiSun aria-label="Switch to light mode" fontSize="1.5rem" onClick={toggleColorMode} />
                    ) : (
                        <FiMoon aria-label="Switch to dark mode" fontSize="1.5rem" onClick={toggleColorMode} />
                    )}

                    {connector === injected && !error ? (
                        <Tag color="light.100" mx="1rem" borderColor={bgColor4[colorMode]} bg={bgColor4[colorMode]}>
                            {!!account && shortenAddress(account)}
                        </Tag>
                    ) : (
                        <Button
                            color="light.100"
                            mx="1rem"
                            borderColor={bgColor4[colorMode]}
                            bg={bgColor4[colorMode]}
                            _hover={{ bg: bgColor4[colorMode] }}
                            _active={{ bg: bgColor4[colorMode] }}
                            onClick={() => activate(injected)}
                            isDisabled={!triedEager || !!error}
                        >
                            Connect
                        </Button>
                    )}

                    <Box display={{ sm: 'block', md: 'none' }}>
                        <FiChevronDown aria-label="open" onClick={onOpen} />
                    </Box>
                </Flex>
            </Flex>

            <Drawer isOpen={isOpen} placement="top" onClose={onClose}>
                <DrawerOverlay>
                    <DrawerContent color="light.100" bg={bgColor3[colorMode]}>
                        <DrawerBody>
                            <Flex justify="center" align="center" my="1rem">
                                <NextLink href="/dashboard" passHref>
                                    <Link
                                        textTransform="uppercase"
                                        fontWeight="bold"
                                        href="/dashboard"
                                        fontSize="1.25rem"
                                    >
                                        Dashboard
                                    </Link>
                                </NextLink>
                            </Flex>

                            <Flex justify="center" align="center" my="1rem">
                                <NextLink href="/markets" passHref>
                                    <Link
                                        textTransform="uppercase"
                                        fontWeight="bold"
                                        href="/markets"
                                        fontSize="1.25rem"
                                    >
                                        Markets
                                    </Link>
                                </NextLink>
                            </Flex>

                            {isOwner && (
                                <Flex justify="center" align="center" my="1rem">
                                    <Link textTransform="uppercase" fontWeight="bold" href="/admin" fontSize="1.25rem">
                                        Admin
                                    </Link>
                                </Flex>
                            )}
                        </DrawerBody>
                    </DrawerContent>
                </DrawerOverlay>
            </Drawer>
        </>
    );
};

export default Header;
