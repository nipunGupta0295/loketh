import React, { Component } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

import { Navbar } from './components';
import LokethContract from './contracts/Loketh.json';
import getWeb3 from './getWeb3';
import { Events, MyEvents, MyTickets } from './pages';
import { handleError } from './utils';

import './App.css';
import { Box, Flex, Container } from '@chakra-ui/react';

class App extends Component {
  state = {
    accounts: [],
    initialized: false,
    loketh: null,
    web3: null,
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3((accounts) => {
        this.setState({ accounts });
      });

      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();

      // eslint-disable-next-line
      if (networkId != process.env.REACT_APP_NETWORK_ID) {
        throw new Error('You are connected to the wrong network.');
      }

      const deployedNetwork = LokethContract.networks[networkId];

      if (!deployedNetwork) {
        throw new Error('Loketh contract has not deployed.');
      }

      const instance = new web3.eth.Contract(
        LokethContract.abi,
        deployedNetwork.address
      );

      this.setState({ accounts, initialized: true, loketh: instance, web3 });
    } catch (error) {
      // Catch any errors for any of the above operations.
      handleError(error);
    }
  };

  render() {
    const { accounts, initialized, loketh, web3 } = this.state;

    return (
      <Router>
        <Flex flexDir={'row'} gap="20px" width={'100vw'} height="100vh">
          <Navbar
            flex="1"
            accounts={accounts}
            initialized={initialized}
            loketh={loketh}
            web3={web3}
          />
          <Flex pt={50} justify="center" flex="4" >
            <Switch>
              <Route path="/my-events">
                <MyEvents
                  accounts={accounts}
                  initialized={initialized}
                  loketh={loketh}
                  web3={web3}
                />
              </Route>
              <Route path="/my-tickets">
                <MyTickets
                  accounts={accounts}
                  initialized={initialized}
                  loketh={loketh}
                  web3={web3}
                />
              </Route>
              <Route path="/">
                <Events
                  accounts={accounts}
                  initialized={initialized}
                  loketh={loketh}
                  web3={web3}
                />
              </Route>
            </Switch>
          </Flex>
        </Flex>
      </Router>
    );
  }
}

export default App;
