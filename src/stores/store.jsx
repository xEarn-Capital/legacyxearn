import config from "../config";
import async from 'async';
import * as moment from 'moment';
import bigDecimal from "js-big-decimal";
import $ from 'jquery';
import {
  ERROR,
  CONFIGURE,
  CONFIGURE_RETURNED,
  GET_BALANCES,
  GET_BALANCES_RETURNED,
  GET_BALANCES_PERPETUAL,
  GET_BALANCES_PERPETUAL_RETURNED,
  STAKE,
  STAKE_RETURNED,
  WITHDRAW,
  WITHDRAW_RETURNED,
  GET_REWARDS,
  GET_REWARDS_RETURNED,
  EXIT,
  EXIT_RETURNED,
  PROPOSE,
  PROPOSE_RETURNED,
  GET_PROPOSALS,
  GET_PROPOSALS_RETURNED,
  VOTE_FOR,
  VOTE_FOR_RETURNED,
  VOTE_AGAINST,
  VOTE_AGAINST_RETURNED,
  GET_CLAIMABLE_ASSET,
  GET_CLAIMABLE_ASSET_RETURNED,
  CLAIM,
  CLAIM_RETURNED,
  GET_CLAIMABLE,
  GET_CLAIMABLE_RETURNED,
  GET_YCRV_REQUIREMENTS,
  GET_YCRV_REQUIREMENTS_RETURNED,
  BUY_ETH,
  BUY_USDT,
  BUY_QRX,
  DRAW_WINNER
} from '../constants';
import Web3 from 'web3';



import {
  injected,
  walletconnect,
  walletlink,
  ledger,
  trezor,
  frame,
  fortmatic,
  portis,
  squarelink,
  torus,
  authereum
} from "./connectors";

const {
  createApolloFetch
} = require('apollo-fetch');

const fetch = createApolloFetch({
  uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
});


const rp = require('request-promise');
const ethers = require('ethers');

const Dispatcher = require('flux').Dispatcher;
const Emitter = require('events').EventEmitter;

const dispatcher = new Dispatcher();
const emitter = new Emitter();

class Store {
  constructor() {

    this.store = {
      currentBlock: 0,
      universalGasPrice: '70',
      account: {},
      web3: null,
      connectorsByName: {
        MetaMask: injected,
        TrustWallet: injected,
        WalletConnect: walletconnect,
        WalletLink: walletlink,
        Ledger: ledger,
        Trezor: trezor,
        Frame: frame,
        Fortmatic: fortmatic,
        Portis: portis,
        Squarelink: squarelink,
        Torus: torus,
        Authereum: authereum
      },
      web3context: null,
      languages: [
        {
          language: 'English',
          code: 'en'
        },
        {
          language: 'Japanese',
          code: 'ja'
        },
        {
          language: 'Chinese',
          code: 'zh'
        }
      ],
      proposals: [
      ],
      claimableAsset: {
        id: 'YYFI',
        name: 'yearn.finance',
        address: config.yfiAddress,
        abi: config.yfiABI,
        symbol: 'YYFI',
        balance: 0,
        decimals: 18,
        rewardAddress: '0xfc1e690f61efd961294b3e1ce3313fbd8aa4f85d',
        rewardSymbol: 'aDAI',
        rewardDecimals: 18,
        claimableBalance: 0
      },
      rewardPools: [
        {
          id: 'Lottery',
          name: '',
          website: '',
          link: '',
          YieldCalculatorLink: "",
          depositsEnabled: true,
          tokens: [
            {
              id: 'UNI-LP',
              address: config.xrnuniswaptoken,
              symbol: 'ETH',
              abi: config.erc20ABI,
              decimals: 18,
              rewardsAddress: config.qrxlotteryaddress,
              rewardsABI: config.qrxlotteryabi,
              rewardsSymbol: 'QRX',
              decimals: 18,
              balance: 0,
              stakedBalance: 0,
              referralRewards: 0,
              rewardsClaimed: 0,
              nextHalving: 0,
              winners: [],
              currentPeriod: 1,
              owner: "0x055bcD37342c77367e4a3591c11C54be198189C3",
              operator: "0x055bcD37342c77367e4a3591c11C54be198189C3",
              collector: "0x4B8d43576aB86Bf008ECFADfeEAF9793B603EC15",
              usdtaddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7", //   0xdAC17F958D2ee523a2206206994597C13D831ec7
              qrxaddress: "0x6e0dade58d2d89ebbe7afc384e3e4f15b70b14d8" //  0x6e0dade58d2d89ebbe7afc384e3e4f15b70b14d8
            }
          ]
        },

        // {
        //   id: 'Governance',
        //   name: 'Governance',
        //   website: 'pools.balancer.exchange',
        //   link: 'https://pools.balancer.exchange/#/pool/0x95c4b6c7cff608c0ca048df8b81a484aa377172b',
        //   depositsEnabled: true,
        //   tokens: [
        //     {
        //       id: 'bpt',
        //       address: '0x95c4b6c7cff608c0ca048df8b81a484aa377172b',
        //       symbol: 'BPT',
        //       abi: config.bpoolABI,
        //       decimals: 18,
        //       rewardsAddress: config.governanceAddress,
        //       rewardsABI: config.governanceABI,
        //       rewardsSymbol: 'YYFI',
        //       decimals: 18,
        //       balance: 0,
        //       stakedBalance: 0,
        //       rewardsAvailable: 0
        //     }
        //   ]
        // },
        // {
        //   id: 'Fee Rewards',
        //   name: 'Fee Rewards',
        //   website: 'ygov.finance',
        //   link: 'https://ygov.finance/',
        //   depositsEnabled: true,
        //   tokens: [
        //     {
        //       id: 'YYFI',
        //       address: config.yfiAddress,
        //       symbol: 'YYFI',
        //       abi: config.yfiABI,
        //       decimals: 18,
        //       rewardsAddress: config.feeRewardsAddress,
        //       rewardsABI: config.feeRewardsABI,
        //       rewardsSymbol: '$',
        //       decimals: 18,
        //       balance: 0,
        //       stakedBalance: 0,
        //       rewardsAvailable: 0
        //     }
        //   ]
        // }
      ]
    }

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case CONFIGURE:
            this.configure(payload);
            break;
          case GET_BALANCES:
            this.getBalances(payload);
            break;
          case GET_BALANCES_PERPETUAL:
            this.getBalancesPerpetual(payload);
            break;
          case STAKE:
            this.stake(payload);
            break;
          case WITHDRAW:
            this.withdraw(payload);
            break;
          case GET_REWARDS:
            this.getReward(payload);
            break;
          case EXIT:
            this.exit(payload);
            break;
          case PROPOSE:
            this.propose(payload)
            break;
          case GET_PROPOSALS:
            this.getProposals(payload)
            break;
          case VOTE_FOR:
            this.voteFor(payload)
            break;
          case VOTE_AGAINST:
            this.voteAgainst(payload)
            break;
          case GET_CLAIMABLE_ASSET:
            this.getClaimableAsset(payload)
            break;
          case CLAIM:
            this.claim(payload)
            break;
          case GET_CLAIMABLE:
            this.getClaimable(payload)
            break;
          case GET_YCRV_REQUIREMENTS:
            this.getYCRVRequirements(payload)
            break;
          case BUY_QRX:
            this.buyQrx(payload)
            break;
          case BUY_ETH:
            this.buyEth(payload)
            break;
          case BUY_USDT:
            this.buyUsdt(payload)
            break;
          case DRAW_WINNER:
            this.drawWinner(payload)
            break;
          default: {
          }
        }
      }.bind(this)
    );
  }

  getStore(index) {
    return (this.store[index]);
  };

  setStore(obj) {
    this.store = { ...this.store, ...obj }
    // console.log(this.store)
    return emitter.emit('StoreUpdated');
  };

  configure = async () => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    const currentBlock = await web3.eth.getBlockNumber()

    store.setStore({ currentBlock: currentBlock })

    window.setTimeout(() => {
      emitter.emit(CONFIGURE_RETURNED)
    }, 100)
  }

  getBalancesPerpetual = async () => {
    const pools = store.getStore('rewardPools')
    const account = store.getStore('account')

    const web3 = new Web3(store.getStore('web3context').library.provider);

    const currentBlock = await web3.eth.getBlockNumber()
    store.setStore({ currentBlock: currentBlock })

    async.map(pools, (pool, callback) => {

      async.map(pool.tokens, (token, callbackInner) => {

        async.parallel([
          (callbackInnerInner) => { this._getERC20Balance(web3, token, account, callbackInnerInner) },
          (callbackInnerInner) => { this._getstakedBalance(web3, token, account, callbackInnerInner) },
          (callbackInnerInner) => { this._getReferralRewards(web3, token, account, callbackInnerInner) },
          (callbackInnerInner) => { this._getWinners(web3, token, account, callbackInnerInner) },
          (callbackInnerInner) => { this._getRewardHalving(web3, token, account, callbackInnerInner) },
          (callbackInnerInner) => { this._getCurrentPeriod(web3, token, account, callbackInnerInner) }
        ], (err, data) => {
          if (err) {
            console.log(err)
            return callbackInner(err)
          }

          token.balance = data[0]
          token.stakedBalance = data[1]
          token.referralRewards = data[2]
          token.winners = data[3]
          token.nextHalving = data[4] - (Date.now() / 1000)
          token.currentPeriod = data[5]

          callbackInner(null, token)
        })
      }, (err, tokensData) => {
        if (err) {
          console.log(err)
          return callback(err)
        }

        pool.tokens = tokensData
        callback(null, pool)
      })

    }, (err, poolData) => {
      if (err) {
        console.log(err)
        return emitter.emit(ERROR, err)
      }
      store.setStore({ rewardPools: poolData })
      emitter.emit(GET_BALANCES_PERPETUAL_RETURNED)
    })
  }

  getBalances = () => {
    const pools = store.getStore('rewardPools')
    const account = store.getStore('account')

    const web3 = new Web3(store.getStore('web3context').library.provider);

    async.map(pools, (pool, callback) => {

      async.map(pool.tokens, (token, callbackInner) => {

        async.parallel([
          (callbackInnerInner) => { this._getERC20Balance(web3, token, account, callbackInnerInner) },
          (callbackInnerInner) => { this._getstakedBalance(web3, token, account, callbackInnerInner) },
          (callbackInnerInner) => { this._getReferralRewards(web3, token, account, callbackInnerInner) }
        ], (err, data) => {
          if (err) {
            console.log(err)
            return callbackInner(err)
          }

          token.balance = data[0]
          token.stakedBalance = data[1]
          token.rewardsAvailable = data[2]

          callbackInner(null, token)
        })
      }, (err, tokensData) => {
        if (err) {
          console.log(err)
          return callback(err)
        }

        pool.tokens = tokensData
        callback(null, pool)
      })

    }, (err, poolData) => {
      if (err) {
        console.log(err)
        return emitter.emit(ERROR, err)
      }
      store.setStore({ rewardPools: poolData })
      emitter.emit(GET_BALANCES_RETURNED)
    })
  }

  _checkApproval = async (asset, account, amount, contract, callback) => {
    try {
      const web3 = new Web3(store.getStore('web3context').library.provider);
      const erc20Contract = new web3.eth.Contract(asset.abi, asset.address)
      const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })
      const ethAllowance = web3.utils.fromWei(allowance, "ether")
      if (parseFloat(ethAllowance) < parseFloat(amount)) {
        await erc20Contract.methods.approve(contract, web3.utils.toWei("999999999999999999", "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        callback()
      } else {
        callback()
      }
    } catch (error) {
      console.log(error)
      if (error.message) {
        return callback(error.message)
      }
      callback(error)
    }
  }

  _checkApprovalWaitForConfirmation = async (asset, account, amount, contract, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    let erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.address)
    const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })

    const ethAllowance = web3.utils.fromWei(allowance, "ether")

    if (parseFloat(ethAllowance) < parseFloat(amount)) {
      erc20Contract.methods.approve(contract, web3.utils.toWei("999999999999999999", "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        .on('transactionHash', function (hash) {
          callback()
        })
        .on('error', function (error) {
          if (!error.toString().includes("-32601")) {
            if (error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })
    } else {
      callback()
    }
  }

  _getERC20Balance = async (web3, asset, account, callback) => {

    try {
      var balance = await web3.eth.getBalance(account.address);
      balance = web3.utils.fromWei(balance.toString(), "ether");
      //  balance = parseFloat(balance)/10**asset.decimals
      callback(null, balance)
    } catch (ex) {
      return callback(ex)
    }
  }

  _getstakedBalance = async (web3, asset, account, callback) => {
    console.log(web3);
    const contract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)
    const period = await contract.methods.currentPeriod().call();
    console.log("current period: " + period);
    var depositedTokens = new bigDecimal(0);
    if (period == 1) {
      let stakedamnt = await contract.methods._weeklyDraw1(account.address).call();
      depositedTokens = new bigDecimal(web3.utils.fromWei(stakedamnt.depositedAmount.toString(), "ether").toString());
    } else if (period == 2) {
      let stakedamnt = await contract.methods._weeklyDraw2(account.address).call();
      depositedTokens = new bigDecimal(web3.utils.fromWei(stakedamnt.depositedAmount.toString(), "ether").toString());
    } else if (period == 3) {
      let stakedamnt = await contract.methods._weeklyDraw3(account.address).call();
      depositedTokens = new bigDecimal(web3.utils.fromWei(stakedamnt.depositedAmount.toString(), "ether").toString());
    } else if (period == 4) {
      let stakedamnt = await contract.methods._weeklyDraw4(account.address).call();
      depositedTokens = new bigDecimal(web3.utils.fromWei(stakedamnt.depositedAmount.toString(), "ether").toString());
    } else if (period == 5) {
      let stakedamnt = await contract.methods._weeklyDraw5(account.address).call();
      depositedTokens = new bigDecimal(web3.utils.fromWei(stakedamnt.depositedAmount.toString(), "ether").toString());
    }

    callback(null, depositedTokens.getValue())

  }

  _getReferralRewards = async (web3, asset, account, callback) => {
    const contract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)
    const START_BLOCK = "7489936"; //mainnet 11203763
    const END_BLOCK = "latest";
    console.log("Getting past events...")
    var depositedTokens = new bigDecimal(0);
    await contract.getPastEvents("TransferedReferralReward", {
      fromBlock: START_BLOCK,
      toBlock: END_BLOCK // You can also specify 'latest'
    })
      .then(events => {
        console.log("Found events transfer ref reward:", events)
        events.forEach(event => {
          if (event.returnValues.user.toString().toLowerCase() == account.address.toString().toLowerCase()) {
            var amount = new bigDecimal(web3.utils.fromWei(event.returnValues.amount.toString(), "ether").toString());
            depositedTokens = depositedTokens.add(amount);
            console.log(amount.getValue())
            console.log("found address in event: " + amount.getValue())

          }
        });
      })
      .catch((err) => console.error(err))
    console.log(depositedTokens.getValue());
    callback(null, depositedTokens.getValue())

  }




  _getRewardHalving = async (web3, asset, account, callback) => {
    let erc20Contract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)

    try {
      const periodFinish = await erc20Contract.methods.periodDelay().call();
      const periodStart = await erc20Contract.methods.periodStart().call();
      console.log(periodStart);
      console.log(periodFinish);
      let combine = Number(periodFinish) + Number(periodStart);
      console.log(combine);
      callback(null, combine)
    } catch (ex) {
      console.log(ex);
      //  return callback(ex)
    }
  }

  _getCurrentPeriod = async (web3, asset, account, callback) => {
    let erc20Contract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)

    try {
      const period = await erc20Contract.methods.currentPeriod().call();
      callback(null, period)
    } catch (ex) {
      return callback(ex)
    }
  }

  _getWinners = async (web3, asset, account, callback) => {
    const contract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)
    const START_BLOCK = "7489936"; //mainnet 11203763
    const END_BLOCK = "latest";
    console.log("Getting past events...")
    var depositedTokens = [];
    let addy = null;
    await contract.getPastEvents("Drawn", {
      fromBlock: START_BLOCK,
      toBlock: END_BLOCK // You can also specify 'latest'
    })
      .then(events => {
        console.log("Found events winenr draw:", events)
        events.forEach(event => {
          var winner = event.returnValues.winner.toString();
          if (winner) {
            addy =
              winner.substring(0, 6) +
              "..." +
              winner.substring(
                winner.length - 4,
                winner.length
              );
          }
          depositedTokens.push(addy);
          console.log("found winner in event: " + winner)

        });
      })
      .catch((err) => console.error(err))
    console.log(depositedTokens)
    callback(null, depositedTokens)
  }

  _getRewardsAvailable = async (web3, asset, account, callback) => {
    let erc20Contract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)

    try {
      var earned = await erc20Contract.methods.earned(account.address).call({ from: account.address });
      earned = web3.utils.fromWei(earned.toString(), "ether");
      callback(null, parseFloat(earned))
    } catch (ex) {
      return callback(ex)
    }
  }

  _checkIfApprovalIsNeeded = async (asset, account, amount, contract, callback, overwriteAddress) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    let erc20Contract = new web3.eth.Contract(config.erc20ABI, (overwriteAddress ? overwriteAddress : asset.address))
    const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })

    const ethAllowance = web3.utils.fromWei(allowance, "ether")
    if (parseFloat(ethAllowance) < parseFloat(amount)) {
      asset.amount = amount
      callback(null, asset)
    } else {
      callback(null, false)
    }
  }

  _callApproval = async (asset, account, amount, contract, last, callback, overwriteAddress) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    let erc20Contract = new web3.eth.Contract(config.erc20ABI, (overwriteAddress ? overwriteAddress : asset.address))
    try {
      if (last) {
        await erc20Contract.methods.approve(contract, web3.utils.toWei("999999999999999999", "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        callback()
      } else {
        erc20Contract.methods.approve(contract, web3.utils.toWei("999999999999999999", "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
          .on('transactionHash', function (hash) {
            callback()
          })
          .on('error', function (error) {
            if (!error.toString().includes("-32601")) {
              if (error.message) {
                return callback(error.message)
              }
              callback(error)
            }
          })
      }
    } catch (error) {
      if (error.message) {
        return callback(error.message)
      }
      callback(error)
    }
  }

  lookUpPrices = async (id_array) => {
    let ids = id_array.join("%2C");
    return $.ajax({
      url: "https://api.coingecko.com/api/v3/simple/price?ids=" + ids + "&vs_currencies=usd",
      type: 'GET'
    })
  }

  stake = (payload) => {
    const account = store.getStore('account')
    const { asset, amount, referral } = payload.content
    console.log(asset);
    console.log(account);
    console.log(amount);
    console.log(referral);


    this._callStake(asset, account, amount, referral, (err, res) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(STAKE_RETURNED, res)
    })
  }

  buyEth = (payload) => {
    const account = store.getStore('account')
    const { asset } = payload.content
    console.log(asset);
    console.log(account);


    this._callBuyEth(asset, account, (err, res) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(STAKE_RETURNED, res)
    })
  }

  _callBuyEth = async (asset, account, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    var balance = await web3.eth.getBalance(account.address);
    balance = web3.utils.fromWei(balance.toString(), "ether");

    let response = await this.lookUpPrices(["ethereum"]);
    const ethusd = response["ethereum"].usd;
    const ethRequired = 5000 / Number(ethusd)
    console.log("eth req: " + ethRequired);
    if (balance >= ethRequired) {
      web3.eth.sendTransaction({ to: asset.collector, from: account.address, value: web3.utils.toWei(ethRequired.toString(), "ether") })
        .on('transactionHash', function (hash) {
          console.log(hash)
          callback(null, hash)
        })
        .on('confirmation', function (confirmationNumber, receipt) {
          console.log(confirmationNumber, receipt);
          if (confirmationNumber == 2) {
            dispatcher.dispatch({ type: GET_BALANCES_PERPETUAL, content: {} })
          }
        })
        .on('receipt', function (receipt) {
          console.log(receipt);
        })
        .on('error', function (error) {
          if (!error.toString().includes("-32601")) {
            if (error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })
        .catch((error) => {
          if (!error.toString().includes("-32601")) {
            if (error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })
    } else {
      return emitter.emit(ERROR, "Not enough Ethereum balance.");
    }

  }

  _callBuyUsdt = async (asset, account, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    const usdtContract = new web3.eth.Contract(asset.abi, asset.usdtaddress)
    var balance = await usdtContract.methods.balanceOf(account.address).call({ from: account.address });
    balance = web3.utils.fromWei(balance.toString(), "mwei");
    const usdtRequired = 5000;
    console.log("eth req: " + usdtRequired);
    if (Number(balance) >= Number(usdtRequired)) {
      usdtContract.methods.transfer(asset.collector, web3.utils.toWei(usdtRequired.toString(), "mwei")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        .on('transactionHash', function (hash) {
          console.log(hash)
          callback(null, hash)
        })
        .on('confirmation', function (confirmationNumber, receipt) {
          console.log(confirmationNumber, receipt);
          if (confirmationNumber == 2) {
            dispatcher.dispatch({ type: GET_BALANCES_PERPETUAL, content: {} })
          }
        })
        .on('receipt', function (receipt) {
          console.log(receipt);
        })
        .on('error', function (error) {
          if (!error.toString().includes("-32601")) {
            if (error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })
        .catch((error) => {
          if (!error.toString().includes("-32601")) {
            if (error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })
    } else {
      return emitter.emit(ERROR, "Not enough USDT balance.");
    }

  }

  _callDrawWinner = async (asset, account, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    const lotteryContract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)
    lotteryContract.methods.drawWinner().send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function (hash) {
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        console.log(confirmationNumber, receipt);
        if (confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_BALANCES_PERPETUAL, content: {} })
        }
      })
      .on('receipt', function (receipt) {
        console.log(receipt);
      })
      .on('error', function (error) {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }


  _callBuyQrx = async (asset, account, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    const qrxContract = new web3.eth.Contract(asset.abi, asset.qrxaddress)
    var balance = await qrxContract.methods.balanceOf(account.address).call({ from: account.address });
    balance = web3.utils.fromWei(balance.toString(), "ether");
    let response = await this.lookUpPrices(["quiverx"]);
    const qrxusd = response["quiverx"].usd;
    console.log(qrxusd);
    const qrxRequired = 5000 / Number(qrxusd)
    console.log(qrxRequired)
    if (Number(balance) >= Number(qrxRequired)) {
      qrxContract.methods.transfer(asset.collector, web3.utils.toWei(qrxRequired.toString(), "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        .on('transactionHash', function (hash) {
          console.log(hash)
          callback(null, hash)
        })
        .on('confirmation', function (confirmationNumber, receipt) {
          console.log(confirmationNumber, receipt);
          if (confirmationNumber == 2) {
            dispatcher.dispatch({ type: GET_BALANCES_PERPETUAL, content: {} })
          }
        })
        .on('receipt', function (receipt) {
          console.log(receipt);
        })
        .on('error', function (error) {
          if (!error.toString().includes("-32601")) {
            if (error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })
        .catch((error) => {
          if (!error.toString().includes("-32601")) {
            if (error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })
    } else {
      return emitter.emit(ERROR, "Not enough QRX balance.");
    }

  }
  buyQrx = (payload) => {
    const account = store.getStore('account')
    const { asset, amount } = payload.content
    console.log(asset);
    console.log(account);
    console.log(amount);


    this._callBuyQrx(asset, account, (err, res) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(STAKE_RETURNED, res)
    })
  }
  buyUsdt = (payload) => {
    const account = store.getStore('account')
    const { asset, amount } = payload.content
    console.log(asset);
    console.log(account);
    console.log(amount);

    this._callBuyUsdt(asset, account, (err, res) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(STAKE_RETURNED, res)
    })
  }

  drawWinner = (payload) => {
    const account = store.getStore('account')
    const { asset, amount } = payload.content
    console.log(asset);
    console.log(account);

    this._callDrawWinner(asset, account, (err, res) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(STAKE_RETURNED, res)
    })
  }


  _callStake = async (asset, account, amount, referral, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    const yCurveFiContract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)

    var amountToSend = web3.utils.toWei(amount, "ether")
    if (asset.decimals != 18) {
      amountToSend = (amount * 10 ** asset.decimals).toFixed(0);
    }

    yCurveFiContract.methods.deposit(referral).send({ value: amountToSend, from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function (hash) {
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        console.log(confirmationNumber, receipt);
        if (confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_BALANCES_PERPETUAL, content: {} })
        }
      })
      .on('receipt', function (receipt) {
        console.log(receipt);
      })
      .on('error', function (error) {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  withdraw = (payload) => {
    const account = store.getStore('account')
    const { asset, amount } = payload.content

    this._callWithdraw(asset, account, amount, (err, res) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(WITHDRAW_RETURNED, res)
    })
  }

  _callWithdraw = async (asset, account, amount, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    const yCurveFiContract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)

    var amountToSend = web3.utils.toWei(amount, "ether")
    if (asset.decimals != 18) {
      amountToSend = (amount * 10 ** asset.decimals).toFixed(0);
    }

    yCurveFiContract.methods.withdraw(amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function (hash) {
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        console.log(confirmationNumber, receipt);
        if (confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_BALANCES, content: {} })
        }
      })
      .on('receipt', function (receipt) {
        console.log(receipt);
      })
      .on('error', function (error) {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  getReward = (payload) => {
    const account = store.getStore('account')
    const { asset } = payload.content

    this._callGetReward(asset, account, (err, res) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(GET_REWARDS_RETURNED, res)
    })
  }

  _callGetReward = async (asset, account, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    const yCurveFiContract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)

    yCurveFiContract.methods.getReward().send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function (hash) {
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        console.log(confirmationNumber, receipt);
        if (confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_BALANCES, content: {} })
        }
      })
      .on('receipt', function (receipt) {
        console.log(receipt);
      })
      .on('error', function (error) {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  exit = (payload) => {
    const account = store.getStore('account')
    const { asset } = payload.content

    this._callExit(asset, account, (err, res) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(EXIT_RETURNED, res)
    })
  }

  _callExit = async (asset, account, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    const yCurveFiContract = new web3.eth.Contract(asset.rewardsABI, asset.rewardsAddress)

    yCurveFiContract.methods.exit().send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function (hash) {
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        console.log(confirmationNumber, receipt);
        if (confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_BALANCES, content: {} })
        }
      })
      .on('receipt', function (receipt) {
        console.log(receipt);
      })
      .on('error', function (error) {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  propose = (payload) => {
    const account = store.getStore('account')

    this._callPropose(account, (err, res) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(PROPOSE_RETURNED, res)
    })
  }

  _callPropose = async (account, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    const governanceContract = new web3.eth.Contract(config.governanceABI, config.governanceAddress)

    governanceContract.methods.propose().send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function (hash) {
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        console.log(confirmationNumber, receipt);
        if (confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_BALANCES, content: {} })
        }
      })
      .on('receipt', function (receipt) {
        console.log(receipt);
      })
      .on('error', function (error) {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  getProposals = (payload) => {
    // emitter.emit(GET_PROPOSALS_RETURNED)
    const account = store.getStore('account')
    const web3 = new Web3(store.getStore('web3context').library.provider);

    this._getProposalCount(web3, account, (err, proposalCount) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      let arr = Array.from(Array(parseInt(proposalCount)).keys())

      if (proposalCount == 0) {
        arr = []
      }

      async.map(arr, (proposal, callback) => {
        this._getProposals(web3, account, proposal, callback)
      }, (err, proposalsData) => {
        if (err) {
          return emitter.emit(ERROR, err);
        }

        store.setStore({ proposals: proposalsData })
        emitter.emit(GET_PROPOSALS_RETURNED)
      })

    })
  }

  _getProposalCount = async (web3, account, callback) => {
    try {
      const governanceContract = new web3.eth.Contract(config.governanceABI, config.governanceAddress)
      var proposals = await governanceContract.methods.proposalCount().call({ from: account.address });
      callback(null, proposals)
    } catch (ex) {
      return callback(ex)
    }
  }

  _getProposals = async (web3, account, number, callback) => {
    try {
      const governanceContract = new web3.eth.Contract(config.governanceABI, config.governanceAddress)
      var proposals = await governanceContract.methods.proposals(number).call({ from: account.address });
      callback(null, proposals)
    } catch (ex) {
      return callback(ex)
    }
  }

  voteFor = (payload) => {
    const account = store.getStore('account')
    const { proposal } = payload.content

    this._callVoteFor(proposal, account, (err, res) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(VOTE_FOR_RETURNED, res)
    })
  }

  _callVoteFor = async (proposal, account, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    const governanceContract = new web3.eth.Contract(config.governanceABI, config.governanceAddress)

    governanceContract.methods.voteFor(proposal.id).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function (hash) {
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        console.log(confirmationNumber, receipt);
        if (confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_PROPOSALS, content: {} })
        }
      })
      .on('receipt', function (receipt) {
        console.log(receipt);
      })
      .on('error', function (error) {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  voteAgainst = (payload) => {
    const account = store.getStore('account')
    const { proposal } = payload.content

    this._callVoteAgainst(proposal, account, (err, res) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(VOTE_AGAINST_RETURNED, res)
    })
  }

  _callVoteAgainst = async (proposal, account, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    const governanceContract = new web3.eth.Contract(config.governanceABI, config.governanceAddress)

    governanceContract.methods.voteAgainst(proposal.id).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function (hash) {
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        console.log(confirmationNumber, receipt);
        if (confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_PROPOSALS, content: {} })
        }
      })
      .on('receipt', function (receipt) {
        console.log(receipt);
      })
      .on('error', function (error) {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  getClaimableAsset = (payload) => {
    const account = store.getStore('account')
    const asset = store.getStore('claimableAsset')

    const web3 = new Web3(store.getStore('web3context').library.provider);

    async.parallel([
      (callbackInnerInner) => { this._getClaimableBalance(web3, asset, account, callbackInnerInner) },
      (callbackInnerInner) => { this._getClaimable(web3, asset, account, callbackInnerInner) },
    ], (err, data) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      asset.balance = data[0]
      asset.claimableBalance = data[1]

      store.setStore({ claimableAsset: asset })
      emitter.emit(GET_CLAIMABLE_ASSET_RETURNED)
    })
  }

  _getClaimableBalance = async (web3, asset, account, callback) => {
    let erc20Contract = new web3.eth.Contract(asset.abi, asset.address)

    try {
      var balance = await erc20Contract.methods.balanceOf(account.address).call({ from: account.address });
      balance = parseFloat(balance) / 10 ** asset.decimals
      callback(null, parseFloat(balance))
    } catch (ex) {
      return callback(ex)
    }
  }

  _getClaimable = async (web3, asset, account, callback) => {
    let claimContract = new web3.eth.Contract(config.claimABI, config.claimAddress)

    try {
      var balance = await claimContract.methods.claimable(account.address).call({ from: account.address });
      balance = parseFloat(balance) / 10 ** asset.decimals
      callback(null, parseFloat(balance))
    } catch (ex) {
      return callback(ex)
    }
  }

  claim = (payload) => {
    const account = store.getStore('account')
    const asset = store.getStore('claimableAsset')
    const { amount } = payload.content

    this._checkApproval(asset, account, amount, config.claimAddress, (err) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      this._callClaim(asset, account, amount, (err, res) => {
        if (err) {
          return emitter.emit(ERROR, err);
        }

        return emitter.emit(CLAIM_RETURNED, res)
      })
    })
  }

  _callClaim = async (asset, account, amount, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    const claimContract = new web3.eth.Contract(config.claimABI, config.claimAddress)

    var amountToSend = web3.utils.toWei(amount, "ether")
    if (asset.decimals != 18) {
      amountToSend = (amount * 10 ** asset.decimals).toFixed(0);
    }

    claimContract.methods.claim(amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function (hash) {
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        console.log(confirmationNumber, receipt);
        if (confirmationNumber == 2) {
          dispatcher.dispatch({ type: GET_CLAIMABLE_ASSET, content: {} })
        }
      })
      .on('receipt', function (receipt) {
        console.log(receipt);
      })
      .on('error', function (error) {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if (error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  getClaimable = (payload) => {
    const account = store.getStore('account')
    const asset = store.getStore('claimableAsset')

    const web3 = new Web3(store.getStore('web3context').library.provider);

    async.parallel([
      (callbackInnerInner) => { this._getClaimableBalance(web3, asset, account, callbackInnerInner) },
      (callbackInnerInner) => { this._getClaimable(web3, asset, account, callbackInnerInner) },
    ], (err, data) => {
      if (err) {
        return emitter.emit(ERROR, err);
      }

      asset.balance = data[0]
      asset.claimableBalance = data[1]

      store.setStore({ claimableAsset: asset })
      emitter.emit(GET_CLAIMABLE_RETURNED)
    })
  }

  getYCRVRequirements = async (payload) => {
    try {
      const account = store.getStore('account')
      const web3 = new Web3(store.getStore('web3context').library.provider);

      const governanceContract = new web3.eth.Contract(config.governanceABI, config.governanceAddress)
      let balance = await governanceContract.methods.balanceOf(account.address).call({ from: account.address })
      balance = parseFloat(balance) / 10 ** 18

      const voteLock = await governanceContract.methods.voteLock(account.address).call({ from: account.address })
      const currentBlock = await web3.eth.getBlockNumber()

      const returnOBJ = {
        balanceValid: (balance > 1000),
        voteLockValid: voteLock > currentBlock,
        voteLock: voteLock
      }

      emitter.emit(GET_YCRV_REQUIREMENTS_RETURNED, returnOBJ)

    } catch (ex) {
      return emitter.emit(ERROR, ex);
    }
  }

  _getGasPrice = async () => {
    try {
      const url = 'https://gasprice.poa.network/'
      const priceString = await rp(url);
      const priceJSON = JSON.parse(priceString)
      if (priceJSON) {
        return priceJSON.fast.toFixed(0)
      }
      return store.getStore('universalGasPrice')
    } catch (e) {
      console.log(e)
      return store.getStore('universalGasPrice')
    }
  }
}

var store = new Store();

export default {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter
};
