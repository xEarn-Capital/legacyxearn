import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Typography, Select, MenuItem, FormControl } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import IconButton from "@material-ui/core/IconButton";
import Collapse from "@material-ui/core/Collapse";
import CloseIcon from "@material-ui/icons/Close";
import Button from "@material-ui/core/Button";
// import {
//   Link
// } from "react-router-dom";
import Link from "@material-ui/core/Link";
import { withNamespaces } from "react-i18next";
import i18n from "../../i18n";
import { colors } from "../../theme";
import { spacing } from "../../theme";

import Store from "../../stores";
const store = Store.store;

const styles = (theme) => ({
  root: {
    // position: 'absolute',
    // top: '0px',
    width: "100%",
  },
  alert: {
    backgroundColor: "#000",
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
  footer: {
    padding: "24px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
    [theme.breakpoints.up("sm")]: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      alignItems: "center",
    },
    marginBottom:"12vh"
  },
  footerLinks: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  footerText: {
    cursor: "pointer",
    "& > * + *": {
      marginRight: theme.spacing(6),
    },
    marginLeft: "20vw",
    fontWeight: "bold",
    fontSize: "25px",
    color: "#000 !important",
    ['@media (max-width:720px)']:{
      marginLeft: 0,
      color:"#fff !important"
    }
  },
  languageContainer: {
    paddingLeft: "12px",
    display: "none",
  },
  selectInput: {
    fontSize: "14px",
    color: colors.pink,
  },
  link: {
    textDecoration: "none",
  },
  footerTextRight: {
    fontSize: "16px",
    color: "black",
    marginRight: "20vw",
    fontWeight: "bold",
    valign: "center",
    marginTop: "1vh",
    ['@media (max-width:720px)']:{
      color:"#fff !important"
    }
  },
});

class Footer extends Component {
  constructor(props) {
    super();

    const rewardPools = store.getStore("rewardPools");

    this.state = {
      rewardPools: rewardPools,
      languages: store.getStore("languages"),
      language: "en",
      open: true,
    };
  }

  closeAlert = () => {
    this.setState({ open: false });
  };

  renderRewards = () => {
    const { rewardPools } = this.state;

    return rewardPools.map((rewardPool, index) => {
      return this.renderRewardPool(rewardPool, index);
    });
  };

  renderRewardPool = (rewardPool, index) => {
    const { classes, t } = this.props;
    console.log(rewardPool);
  };

  render() {
    const { classes, t, location } = this.props;
    const { open } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.footer}>
          <div className={classes.footerLinks}>
            <Typography className={classes.footerText} variant="h6">
              <Link className={classes.footerText} style={{marginLeft:0}} href="/">QuiverX</Link>
              {this.renderRewards()}
            </Typography>
            <Typography className={classes.footerTextRight}>
              Safe, secure and Easy-To-Use
            </Typography>
          </div>
        </div>
      </div>
    );
  }
}

export default withNamespaces()(withRouter(withStyles(styles)(Footer)));
