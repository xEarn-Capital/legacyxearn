import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button,
  Card,
  TextField,
  InputAdornment
} from '@material-ui/core';
import Link from '@material-ui/core/Link';
import { withNamespaces } from 'react-i18next';

import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';

import Loader from '../loader'
import Snackbar from '../snackbar'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import Store from "../../stores";
import { colors } from '../../theme'
import Web3 from 'web3';
import {
  ERROR,
  CONFIGURE_RETURNED,
  STAKE,
  STAKE_RETURNED,
  WITHDRAW,
  WITHDRAW_RETURNED,
  GET_REWARDS,
  GET_REWARDS_RETURNED,
  EXIT,
  EXIT_RETURNED,
  GET_YCRV_REQUIREMENTS,
  GET_YCRV_REQUIREMENTS_RETURNED,
  GET_BALANCES_RETURNED,
  GET_BALANCES_PERPETUAL_RETURNED
} from '../../constants'

const styles = theme => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '900px',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  intro: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '400px'
  },
  introCenter: {
    minWidth: '100%',
    textAlign: 'center',
    padding: '48px 0px'
  },
  investedContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    minWidth: '100%',
    [theme.breakpoints.up('md')]: {
      minWidth: '800px',
    }
  },
  connectContainer: {
    padding: '12px',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '450px',
    [theme.breakpoints.up('md')]: {
      width: '450',
    }
  },
  disaclaimer: {
    padding: '12px',
    border: '1px solid rgb(174, 174, 174)',
    borderRadius: '0.75rem',
    marginBottom: '24px',
  },
  addressContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    overflow: 'hidden',
    flex: 1,
    whiteSpace: 'nowrap',
    fontSize: '0.83rem',
    textOverflow:'ellipsis',
    cursor: 'pointer',
    padding: '28px 30px',
    borderRadius: '50px',
    border: '1px solid '+colors.borderBlue,
    alignItems: 'center',
    maxWidth: '500px',
    [theme.breakpoints.up('md')]: {
      width: '100%'
    }
  },
  title: {
    padding: '12px',
    textAlign: 'center'
  },
  subtitle: {
    padding: '12px',
    borderRadius: '0.75rem',
    textAlign: 'center'
  },
  walletAddress: {
    padding: '0px 12px'
  },
  walletTitle: {
    flex: 1,
    color: colors.darkGray
  },
  overview: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '28px 30px',
    borderRadius: '50px',
    border: '1px solid '+colors.borderBlue,
    alignItems: 'center',
    marginTop: '40px',
    width: '100%',
    background: colors.white
  },
  overviewField: {
    display: 'flex',
    flexDirection: 'column'
  },
  overviewTitle: {
    color: colors.darkGray
  },
  overviewValue: {

  },
  actions: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '900px',
    flexWrap: 'wrap',
    background: colors.white,
    border: '1px solid '+colors.borderBlue,
    padding: '28px 30px',
    borderRadius: '50px',
    marginTop: '40px'
  },
  actionContainer: {
    minWidth: 'calc(50% - 40px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px'
  },
  primaryButton: {
    '&:hover': {
      backgroundColor: "#000",
    },
    padding: '20px 32px',
    backgroundColor: "#000",
    borderRadius: '50px',
    fontWeight: 500,
  },
  actionButton: {
    padding: '20px 32px',
    borderRadius: '50px',
  },
  buttonText: {
    fontWeight: '700',
  },
  stakeButtonText: {
    fontWeight: '700',
    color: 'white',
  },
  valContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  actionInput: {
    padding: '0px 0px 12px 0px',
    fontSize: '0.5rem'
  },
  inputAdornment: {
    fontWeight: '600',
    fontSize: '1.5rem'
  },
  assetIcon: {
    display: 'inline-block',
    verticalAlign: 'middle',
    borderRadius: '25px',
    background: '#dedede',
    height: '30px',
    width: '30px',
    textAlign: 'center',
    marginRight: '16px'
  },
  balances: {
    width: '100%',
    textAlign: 'right',
    paddingRight: '20px',
    cursor: 'pointer'
  },
  stakeTitle: {
    width: '100%',
    color: colors.darkGray,
    marginBottom: '20px'
  },
  stakeButtons: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    align: 'center',
    marginTop: '20px'
  },
  stakeButton: {
    minWidth: '300px'
  },
  requirement: {
    display: 'flex',
    alignItems: 'center'
  },
  check: {
    paddingTop: '6px'
  },
  voteLockMessage: {
    margin: '20px'
  }
})

const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store

class Stake extends Component {

  constructor(props) {
    super()

    const account = store.getStore('account')
    const pool = store.getStore('currentPool')

    if(!pool) {
      props.history.push('/')
    }

    this.state = {
      pool: pool,
      loading: !(account || pool),
      account: account,
      value: 'options',
      voteLockValid: false,
      balanceValid: false,
      voteLock: null,
      open: true
    }

    if(pool && ['Fee Rewards', 'Governance'].includes(pool.id)) {
      dispatcher.dispatch({ type: GET_YCRV_REQUIREMENTS, content: {} })
    }
  }

  componentWillMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(STAKE_RETURNED, this.showHash);
    emitter.on(WITHDRAW_RETURNED, this.showHash);
    emitter.on(EXIT_RETURNED, this.showHash);
    emitter.on(GET_REWARDS_RETURNED, this.showHash);
    emitter.on(GET_YCRV_REQUIREMENTS_RETURNED, this.yCrvRequirementsReturned);
    emitter.on(GET_BALANCES_PERPETUAL_RETURNED, this.balancesReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(STAKE_RETURNED, this.showHash);
    emitter.removeListener(WITHDRAW_RETURNED, this.showHash);
    emitter.removeListener(EXIT_RETURNED, this.showHash);
    emitter.removeListener(GET_REWARDS_RETURNED, this.showHash);
    emitter.removeListener(GET_YCRV_REQUIREMENTS_RETURNED, this.yCrvRequirementsReturned);
    emitter.removeListener(GET_BALANCES_PERPETUAL_RETURNED, this.balancesReturned);
  };

  balancesReturned = () => {
    console.log("balances returned");
    const currentPool = store.getStore('currentPool')
    const pools = store.getStore('rewardPools')
    console.log(pools);
    let newPool = pools.filter((pool) => {
      return pool.id === currentPool.id
    })

    if(newPool.length > 0) {
      newPool = newPool[0]
      store.setStore({ currentPool: newPool })
    }
    this.setState({
      pool:newPool
    });
  }

  yCrvRequirementsReturned = (requirements) => {
    this.setState({
      balanceValid: requirements.balanceValid,
      voteLockValid: requirements.voteLockValid,
      voteLock: requirements.voteLock
    })
  }

  showHash  = (txHash) => {
    this.setState({ snackbarMessage: null, snackbarType: null, loading: false })
    const that = this
    setTimeout(() => {
      const snackbarObj = { snackbarMessage: txHash, snackbarType: 'Hash' }
      that.setState(snackbarObj)
    })
  };

  errorReturned = (error) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null }
    this.setState(snackbarObj)
    this.setState({ loading: false })
    const that = this
    setTimeout(() => {
      const snackbarObj = { snackbarMessage: error.toString(), snackbarType: 'Error' }
      that.setState(snackbarObj)
    })
  };

  render() {
    const { classes, t, i18n } = this.props;
    const {
      value,
      account,
      modalOpen,
      pool,
      loading,
      snackbarMessage,
      voteLockValid,
      balanceValid,
    } = this.state

    var address = null;
    if (account.address) {
      address = account.address.substring(0,6)+'...'+account.address.substring(account.address.length-4,account.address.length)
    }

    if(!pool) {
      return null
    }

    return (
      <div className={ classes.root }>
        <Typography variant="h2" className={ classes.title }>
          
        </Typography>

        <div className={ classes.intro }>
          <Card className={ classes.addressContainer } onClick={this.overlayClicked}>
            <Typography variant={ 'h3'} className={ classes.walletTitle } noWrap>{t('Stake.Wallet')}</Typography>
            <Typography variant={ 'h4'} className={ classes.walletAddress } noWrap>{ address }</Typography>
            <div style={{ background: '#DC6BE5', opacity: '1', borderRadius: '10px', width: '10px', height: '10px', marginRight: '3px', marginTop:'3px', marginLeft:'6px' }}></div>
          </Card>
        </div>
        <Typography style={{marginTop:"35px"}} variant='h4' className={ classes.poolName2 }>Current period: { pool.tokens[0].currentPeriod} </Typography>
        <div className={ classes.overview }>
          <div className={ classes.overviewField }>
            <Typography variant={ 'h3' } className={ classes.overviewTitle }>Balance</Typography>
            <Typography variant={ 'h2' } className={ classes.overviewValue }>{Math.floor(pool.tokens[0].balance * 10000) / 10000}  { pool.tokens[0].symbol }</Typography>
          </div>
          <div className={ classes.overviewField }>
            <Typography variant={ 'h3' } className={ classes.overviewTitle }>Deposited ETH</Typography>
            <Typography variant={ 'h2' } className={ classes.overviewValue }>{ Number(pool.tokens[0].stakedBalance) ? Number(pool.tokens[0].stakedBalance).toFixed(6) : "0" }</Typography>
          </div>
          <div className={ classes.overviewField }>
            <Typography variant={ 'h3' } className={ classes.overviewTitle }>Referral Rewards Received</Typography>
    <Typography variant={ 'h2' } className={ classes.overviewValue }>{Number(pool.tokens[0].referralRewards)} QRX</Typography>
          </div>
        </div>
        { pool.id === 'Fee Rewards' &&
          <div className={ classes.actions }>
            <Typography className={ classes.stakeTitle } variant={ 'h3'}>{t('Stake.yCRVRewardRequirements')}</Typography>
            <div className={ classes.requirement }>
              <Typography variant={'h4'}>{t('Stake.YouMustHaveVoted')}</Typography><Typography variant={'h4'} className={ classes.check }>{ voteLockValid ? <CheckIcon style={{ color: colors.green }} /> : <ClearIcon style={{ color: colors.red }} /> }</Typography>
            </div>
            <div className={ classes.requirement }>
              <Typography variant={'h4'}>{t('Stake.YouMustHave')}</Typography><Typography variant={'h4'} className={ classes.check }>{ balanceValid ? <CheckIcon style={{ color: colors.green }} /> : <ClearIcon style={{ color: colors.red }} /> }</Typography>
            </div>
          </div>
        }
        { value === 'options' && this.renderOptions() }
        { value === 'stake' && this.renderStake() }
        { value === 'claim' && this.renderClaim() }
        { value === 'unstake' && this.renderUnstake() }
        { value === 'exit' && this.renderExit() }

        { snackbarMessage && this.renderSnackbar() }
        { loading && <Loader /> }
        <Typography style={{marginTop:"35px"}} variant='h4' className={ classes.poolName2 }>Time until next weekly draw: { this.forHumans(pool.tokens[0].nextHalving )} </Typography>
      </div>
    )
  }

  renderOptions = () => {
    const { classes, t } = this.props;
    const { loading, pool, voteLockValid, balanceValid, voteLock } = this.state

    return (
      <div className={ classes.actions }>
        <div className={ classes.actionContainer}>
         { <Button
            fullWidth
            className={ classes.primaryButton }
            variant="outlined"
            color="primary"
            disabled={ !pool.depositsEnabled || (pool.id === 'Fee Rewards' ?  (loading || !voteLockValid || !balanceValid) : loading) }
            onClick={ () => { this.navigateInternal('stake') } }
            >
            <Typography className={ classes.stakeButtonText } variant={ 'h4'}>Deposit</Typography>
         </Button> }
        </div>
        <div className={ classes.actionContainer}>
          <Button
            fullWidth
            className={ classes.actionButton }
            variant="outlined"
            color="primary"
            disabled={ (pool.id === 'Governance' ? (loading || voteLockValid ) : loading  ) }
            onClick={ () => { this.navigateInternal('unstake') } }
            >
            <Typography className={ classes.buttonText } variant={ 'h4'}>Winners</Typography>
          </Button>
        </div>
        { /*<div className={ classes.actionContainer}>
          <Button
            fullWidth
            className={ classes.actionButton }
            variant="outlined"
            color="primary"
            disabled={ loading }
            onClick={ () => { this.onClaim() } }
            >
            <Typography className={ classes.buttonText } variant={ 'h4'}>{t('Stake.ClaimRewards')}</Typography>
          </Button>
        </div>
        <div className={ classes.actionContainer}>
          <Button
            fullWidth
            className={ classes.actionButton }
            variant="outlined"
            color="primary"
            disabled={ (pool.id === 'Governance' ? (loading || voteLockValid ) : loading  ) }
            onClick={ () => { this.navigateInternal('unstake') } }
            >
            <Typography className={ classes.buttonText } variant={ 'h4'}>{t('Stake.UnstakeTokens')}</Typography>
          </Button>
        </div>
        <div className={ classes.actionContainer}>
          <Button
            fullWidth
            className={ classes.actionButton }
            variant="outlined"
            color="primary"
            disabled={ (pool.id === 'Governance' ? (loading || voteLockValid ) : loading  ) }
            onClick={ () => { this.onExit() } }
            >
            <Typography className={ classes.buttonText } variant={ 'h4'}>{t('Stake.Exit')}</Typography>
          </Button>
         </div> */}
       
      </div>
      
    )
  }

  forHumans = (seconds) =>  {
    const levels = [
      [Math.floor(seconds / 31536000), 'years'],
      [Math.floor((seconds % 31536000) / 86400), 'days'],
      [Math.floor(((seconds % 31536000) % 86400) / 3600), 'hours'],
      [Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), 'minutes'],
      [Math.floor((((seconds % 31536000) % 86400) % 3600) % 60), 'seconds'],
    ]
    let returntext = ''
  
    for (var i = 0, max = levels.length; i < max; i++) {
      if (levels[i][0] === 0) continue
      returntext +=
        ' ' + levels[i][0] + ' ' + (levels[i][0] === 1 ? levels[i][1].substr(0, levels[i][1].length - 1) : levels[i][1])
    }
  
    return returntext.trim()
  }

  navigateInternal = (val) => {
    this.setState({ value: val })
  }

  renderStake = () => {
    const { classes, t } = this.props;
    const { loading, pool } = this.state

    const asset = pool.tokens[0]

    return (
      <div className={ classes.actions }>
        <Typography className={ classes.stakeTitle } variant={ 'h3'}>Deposit ETH</Typography>
        { this.renderAssetInput(asset, 'stake') }
        <div className={ classes.stakeButtons }>
          <Button
            className={ classes.stakeButton }
            variant="outlined"
            color="secondary"
            disabled={ loading }
            onClick={ () => { this.navigateInternal('options') } }
          >
            <Typography variant={ 'h4'}>{t('Stake.Back')}</Typography>
          </Button>{
          <Button
            className={ classes.stakeButton }
            variant="outlined"
            color="secondary"
            disabled={ loading }
            onClick={ () => { this.onStake() } }
          >
            <Typography variant={ 'h4'}>Deposit</Typography>
          </Button>
           }
        </div>

      </div>
    )
  }

  renderUnstake = () => {
    const { classes, t } = this.props;
    const { loading, pool, voteLockValid, account } = this.state

    const asset = pool.tokens[0].winners
    console.log(asset);
    return (
      <div className={ classes.actions }>
        <Typography className={ classes.stakeTitle } variant={ 'h3'}>Winners list</Typography>
        <TableContainer component={Paper}>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Period</TableCell>
            <TableCell align="center">Address</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {asset.map((row,index) => (
            <TableRow key={row.index}>
              <TableCell component="th" scope="row">
                {index+1}
              </TableCell>
              <TableCell align="center">{row}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
        {/* this.renderAssetInput(asset, 'unstake')*/ }
        <div className={ classes.stakeButtons }>
          <Button
            className={ classes.stakeButton }
            variant="outlined"
            color="secondary"
            disabled={ loading }
            onClick={ () => { this.navigateInternal('options') } }
          >
            <Typography variant={ 'h4'}>{t('Stake.Back')}</Typography>
          </Button>
         {account.address == pool.tokens[0].owner || account.address == pool.tokens[0].operator && <Button
            className={ classes.stakeButton }
            variant="outlined"
            color="secondary"
            disabled={ (pool.id === 'Governance' ? (loading || voteLockValid ) : loading  ) }
            onClick={ () => { this.onUnstake() } }
          >
            <Typography variant={ 'h4'}>Draw Winner</Typography>
          </Button>}
        </div>

      </div>
    )
  }

  overlayClicked = () => {
    this.setState({ modalOpen: true })
  }

  closeModal = () => {
    this.setState({ modalOpen: false })
  }

  onStake = () => {
    this.setState({ amountError: false })
    const { pool } = this.state
    const tokens = pool.tokens
    const selectedToken = tokens[0]
    const amount = this.state[selectedToken.id + '_stake']
    let _referral = this.state[selectedToken.id + '_ref']
    console.log(_referral);
    if(_referral == "" ||_referral == null) {
      _referral = "0x0000000000000000000000000000000000000000";
    }
    // if(amount > selectedToken.balance) {
    //   return false
    // }

    this.setState({ loading: true })
    dispatcher.dispatch({ type: STAKE, content: { asset: selectedToken, amount: amount, referral: _referral } })
  }

  onClaim = () => {
    const { pool } = this.state
    const tokens = pool.tokens
    const selectedToken = tokens[0]

    this.setState({ loading: true })
    dispatcher.dispatch({ type: GET_REWARDS, content: { asset: selectedToken } })
  }

  onUnstake = () => {
    this.setState({ amountError: false })
    const { pool } = this.state
    const tokens = pool.tokens
    const selectedToken = tokens[0]
    const amount = this.state[selectedToken.id + '_unstake']
    //
    // if(amount > selectedToken.balance) {
    //   return false
    // }

    this.setState({ loading: true })
    dispatcher.dispatch({ type: WITHDRAW, content: { asset: selectedToken, amount: amount } })
  }

  onExit = () => {
    const { pool } = this.state
    const tokens = pool.tokens
    const selectedToken = tokens[0]

    this.setState({ loading: true })
    dispatcher.dispatch({ type: EXIT, content: { asset: selectedToken } })
  }

  renderAssetInput = (asset, type) => {
    const {
      classes
    } = this.props

    const {
      loading
    } = this.state

    const amount = this.state[asset.id + '_' + type]
    const addy = this.state[asset.id + '_'+"ref"]
    const amountError = this.state[asset.id + '_' + type + '_error']

    return (
      <div className={ classes.valContainer } key={asset.id + '_' + type}>
        <div className={ classes.balances }>
          { type === 'stake' && <Typography variant='h4'  className={ classes.value } noWrap>{ 'Balance: '+ ( asset && asset.balance ? (Math.floor(asset.balance*1000000)/1000000).toFixed(6) : '0.0000') } { asset ? asset.symbol : '' }</Typography> }
          { type === 'unstake' && <Typography variant='h4' onClick={ () => { this.setAmount(asset.id, type, (asset ? asset.stakedBalance : 0)) } } className={ classes.value } noWrap>{ 'Balance: '+ ( asset && asset.stakedBalance ? (Math.floor(asset.stakedBalance*10000)/10000).toFixed(4) : '0.0000') } { asset ? asset.symbol : '' }</Typography> }
        </div>
        <div>
          <TextField
            fullWidth
            disabled={ loading }
            className={ classes.actionInput }
            id={ '' + asset.id + '_' + type }
            value={ amount || '' }
            error={ amountError }
            onChange={ this.onChange.bind(this, type === 'stake'?( asset && asset.balance ? (Math.floor(asset.balance*10000)/10000).toFixed(4) : '0.0000'):( asset && asset.stakedBalance ? (Math.floor(asset.stakedBalance*10000)/10000).toFixed(4) : '0.0000')) }
            placeholder="0.00"
            variant="outlined"
            InputProps={{
              
              endAdornment: <InputAdornment position="end" className={ classes.inputAdornment }><Typography variant='h3' className={ '' }>{ asset.symbol }</Typography></InputAdornment>,
              startAdornment: <InputAdornment position="end" className={ classes.inputAdornment }>
                <div className={ classes.assetIcon }>
                  <img
                    alt=""
                    src={ require('../../assets/'+asset.symbol+'-logo.png') }
                    height="30px"
                  />
                </div>
              </InputAdornment>,
            }}
          />

<TextField
            fullWidth
            disabled={ loading }
            className={ classes.actionInput }
            id={ '' + asset.id + '_' + "ref" }
            value={ addy || '' }
            error={ amountError }
            onChange={ this.onChangeRef.bind(this, type === 'stake'?( asset && asset.balance ? (Math.floor(asset.balance*10000)/10000).toFixed(4) : '0.0000'):( asset && asset.stakedBalance ? (Math.floor(asset.stakedBalance*10000)/10000).toFixed(4) : '0.0000')) }
            placeholder="Referral Address (optional)"
            variant="outlined"
            InputProps={{
              
              endAdornment: <InputAdornment position="end" className={ classes.inputAdornment }><Typography variant='h3' className={ '' }>{ asset.symbol }</Typography></InputAdornment>,
              startAdornment: <InputAdornment position="end" className={ classes.inputAdornment }>
                <div className={ classes.assetIcon }>
                  <img
                    alt=""
                    src={ require('../../assets/'+asset.symbol+'-logo.png') }
                    height="30px"
                  />
                </div>
              </InputAdornment>,
            }}
          />
        </div>
      </div>
    )
  }

  renderSnackbar = () => {
    var {
      snackbarType,
      snackbarMessage
    } = this.state
    return <Snackbar type={ snackbarType } message={ snackbarMessage } open={true}/>
  };

  onChange = (value, event) => {
    
    let val = []
    //val[event.target.id] = value > parseFloat(event.target.value) ? event.target.value : (value + '')
    if(event.target.value == 0.1 ||event.target.value == 0.2 ||event.target.value == 0.3 ||event.target.value == 0.4 ||event.target.value == 0.5 ||event.target.value == 0.6 ||event.target.value == 0.7 ||event.target.value == 0.8 ||event.target.value == 0.9 ||event.target.value == 1 ||event.target.value == 0  || event.target.value == 0.){
      console.log(event.target.value);
        val[event.target.id] = event.target.value;
        this.setState(val)
    }
    
  }

  onChangeRef = (value, event) => {
    var web3 = new Web3();
    let val = []
    let addy;
    console.log(event.target.value);
    if(event.target.value == ""){
      val[event.target.id] = event.target.value;
      this.setState(val)
    } else {
   try {
     addy = web3.utils.toChecksumAddress(event.target.value.toString());
     if(web3.utils.checkAddressChecksum(addy)){
       console.log("addy correct");
       console.log(event.target.id)
      val[event.target.id] = event.target.value;
      this.setState(val)
    }
   } catch (error) {
    val[event.target.id] = "0x0000000000000000000000000000000000000000"
    this.setState(val)
    this.errorReturned("Invalid referral address. Setting to 0x0")
   }
  }
  }

  setAmount = (id, type, balance) => {
    let bal = balance;
    let val = []
    val[id + '_' + type] = bal
    this.setState(val)
  }

}

export default withNamespaces()(withRouter(withStyles(styles)(Stake)));
