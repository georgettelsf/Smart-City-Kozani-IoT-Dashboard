import React from 'react';
import App from 'next/app'
import PropTypes from 'prop-types';
import Head from 'next/head';
import Link from 'next/link';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../theme';
import { Button, Typography, Toolbar, AppBar, IconButton, makeStyles, Card, Grid, Drawer, Divider, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Menu, Home as HomeIcon, Person, DevicesOther, ChevronRight } from '@material-ui/icons';
import clsx from "clsx";
import api from '../api';
import { logOut } from '../auth'
import { isLoggedIn } from '../auth'
import Cookies, { set } from 'js-cookie'

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  hide: {
    display: "none"
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end"
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: -drawerWidth
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: 0
  },
  main: {
    marginTop: 100,
  },
  layout: {
    margin: `0 ${theme.spacing()}`,
    flexGrow: 1,
    // padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
  },
}));


function MyApp(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const { Component, pageProps } = props;

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
    setIsLoggedIn(!!Cookies.get('ticket_management_is_user_logged_in'));
  });

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const logout = () => {
    api.post('/logout').then(response => {
      logOut();
    }).catch(console.log)
  }

  return (
    <React.Fragment>
      <Head>
        <title>IoT Dashboard</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className={classes.root}>
          {isLoggedIn && <>
            <AppBar position="fixed"
              className={clsx(classes.appBar, {
                [classes.appBarShift]: open
              })}>
              <Toolbar>
                <IconButton
                  className={clsx(classes.menuButton, open && classes.hide)}
                  edge="start" color="inherit" aria-label="menu" onClick={handleDrawerOpen}
                >
                  <Menu />
                </IconButton>
                <Typography variant="h6" className={classes.title}>
                  IoT Dashboard
          </Typography>
                <Button color="inherit" onClick={logout}>Logout</Button>
              </Toolbar>
            </AppBar>
            <Drawer
              className={classes.drawer}
              variant="persistent"
              anchor="left"
              open={open}
              classes={{
                paper: classes.drawerPaper
              }}
            >
              <div className={classes.drawerHeader}>
                <IconButton onClick={handleDrawerClose}>
                  <ChevronRight />
                </IconButton>
              </div>
              <Divider />
              <List>
                <Link href="/">
                  <ListItem button key={"Home"}>
                    <ListItemIcon>
                      <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary={"Home"} />
                  </ListItem>
                </Link>
                <Link href="/devices">
                  <ListItem button key={"Devices"}>
                    <ListItemIcon>
                      <DevicesOther />
                    </ListItemIcon>
                    <ListItemText primary={"Devices"} />
                  </ListItem>
                </Link>
                <Link href="/profile">
                  <ListItem button key={"Profile"}>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText primary={"Profile"} />
                  </ListItem>
                </Link>
              </List>
            </Drawer>
          </>}
          <main className={classes.layout}>
            <Component {...pageProps} />
          </main>
        </div>
      </ThemeProvider>
    </React.Fragment>
  );
}

MyApp.getInitialProps = async (appContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);
  const isUserLoggedIn = isLoggedIn(appContext?.req?.headers?.cookie || '');

  return { ...appProps, isLoggedIn: isUserLoggedIn }
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default MyApp;