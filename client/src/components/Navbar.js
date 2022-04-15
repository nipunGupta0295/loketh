import { Flex, Image, Text } from '@chakra-ui/react';
import React, { Component } from 'react';
import { Container, Nav, Navbar as RBNavbar, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MdEventSeat, MdEvent } from 'react-icons/md';
import { ImTicket } from 'react-icons/im';
import { TiGroup } from 'react-icons/ti';
import { fromWei, getShortAddress, handleError } from '../utils';

const Tabs = [
  {
    id: Math.random(),
    icon: <MdEvent />,
    title: 'Events',
    link: '/',
  },
  {
    id: Math.random(),
    icon: <MdEventSeat />,
    title: 'My Events',
    link: '/my-events',
  },
  {
    id: Math.random(),
    icon: <ImTicket />,
    title: 'My Tickets',
    link: '/my-tickets',
  },
];

class Navbar extends Component {
  eventCreatedListener = null;

  moneyWithdrawnListener = null;

  ticketIssuedListener = null;

  state = { account: '', balance: 0, loaded: false };

  componentDidMount = async () => {
    if (this.props.initialized) {
      await this.getAccount();

      this.listenToEventCreated();
      this.listenToMoneyWithdrawn();
      this.listenToTicketIssued();
    }
  };

  componentDidUpdate = async (prevProps) => {
    if (
      this.props.initialized &&
      this.props.initialized !== prevProps.initialized
    ) {
      await this.getAccount();

      this.listenToEventCreated();
      this.listenToMoneyWithdrawn();
      this.listenToTicketIssued();
    }

    if (this.props.accounts !== prevProps.accounts) {
      await this.getAccount();
    }
  };

  getAccount = async () => {
    try {
      this.setState({ loaded: false });

      const { accounts, web3 } = this.props;

      const [account] = accounts;

      const balance = await web3.eth.getBalance(account);

      this.setState({
        account: getShortAddress(account),
        balance: fromWei(balance),
        loaded: true,
      });
    } catch (error) {
      handleError(error);
    }
  };

  listenToEventCreated = () => {
    const { accounts, loketh } = this.props;

    const event = 'data';
    const callback = () => {
      this.getAccount();
    };

    if (this.eventCreatedListener) {
      this.eventCreatedListener.off(event, callback);
      this.eventCreatedListener = null;
    }

    const filter = { organizer: accounts[0] };

    this.eventCreatedListener = loketh.events.EventCreated({ filter });
    this.eventCreatedListener.on(event, callback);
  };

  listenToMoneyWithdrawn = () => {
    const { accounts, loketh } = this.props;

    const event = 'data';
    const callback = () => {
      this.getAccount();
    };

    if (this.moneyWithdrawnListener) {
      this.moneyWithdrawnListener.off(event, callback);
      this.moneyWithdrawnListener = null;
    }

    const filter = { recipient: accounts[0] };

    this.moneyWithdrawnListener = loketh.events.MoneyWithdrawn({ filter });
    this.moneyWithdrawnListener.on(event, callback);
  };

  listenToTicketIssued = () => {
    const { accounts, loketh } = this.props;

    const event = 'data';
    const callback = () => {
      this.getAccount();
    };

    if (this.ticketIssuedListener) {
      this.ticketIssuedListener.off(event, callback);
      this.ticketIssuedListener = null;
    }

    const filter = { participant: accounts[0] };

    this.ticketIssuedListener = loketh.events.TicketIssued({ filter });
    this.ticketIssuedListener.on('data', () => {
      this.getAccount();
    });
  };

  render() {
    const { account, balance, loaded } = this.state;

    const Tab = ({ item }) => {
      return (
        <Link to={item.link} style={{ textDecoration: 'none' }}>
          <Flex
            width={'100%'}
            color="#667085"
            fontWeight={'600'}
            fontSize="14px"
            alignItems={'center'}
            padding="10px 12px"
            borderRadius={'4px'}
            _hover={{ backgroundColor: '#273E66', color: '#fff' }}
            cursor="pointer"
            gap="20px"
          >
            {item.icon}
            <Text>{item.title}</Text>
          </Flex>
        </Link>
      );
    };

    return (
      <>
        <Flex
          flexDir={'column'}
          padding="20px"
          gap={'20px'}
          backgroundColor="#fff"
          width={'300px'}
          marginRight="20px"
          paddingTop={'200px'}
          pos="relative"
          borderRight={'2px solid #F6F9FF'}
        >
          <Flex alignItems="center" gap={'10px'}>
            <TiGroup color="#3762DD" fontSize={'25px'} />
            <Flex flexDir={'column'}>
              <Text fontSize={'25px'} color="#273E66" fontWeight={'600'}>
                Eventall
              </Text>
              <Text fontSize={'12px'} color="#273E66">
                All about your event
              </Text>
            </Flex>
          </Flex>
          {Tabs.map((item) => (
            <Tab item={item} key={item.id} />
          ))}

          <Flex
            position={'absolute'}
            left="10px"
            right="10px"
            bottom="50px"
            bgColor={'#F6F9FF'}
            borderRadius="4px"
            flexDir={'column'}
            padding="15px"
            justifyContent={'center'}
            minHeight={'100px'}
          >
            <Text fontSize={'20px'} color="#273E66" fontWeight={'600'}>
              User Account:
            </Text>
            <Text fontSize={'12px'} color="#273E66">
              {account} ({balance} ETH)
            </Text>
          </Flex>
        </Flex>
      </>
    );
  }
}

export default Navbar;
