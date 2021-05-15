import { useEffect, useState } from 'react';
import api from '../api';
import React from 'react';
import { makeStyles, Card, Grid, Container, Paper, Typography, Button, CircularProgress, Slider } from '@material-ui/core';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer } from 'recharts';
import { useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import withAuth from '../components/withAuth';
import Link from 'next/link';
import RefreshIcon from '@material-ui/icons/Refresh';
import { Checkbox } from '@material-ui/core';
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('../components/Map'), { ssr: false });

const drawerWidth = 240;

function pad2(n) {
  return n > 9 ? "" + n : "0" + n;
}

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
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(4),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  actions: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(),
  },
  refresh: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  loader: {
    marginRight: theme.spacing(2)
  },
  refreshLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  appBarSpacer: theme.mixins.toolbar,
}));

function Home() {

  const theme = useTheme();

  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  const [devices, setDevices] = React.useState([]);
  const [lastReload, setLastReload] = useState(new Date());
  const [forceRefresh, setForceRefresh] = useState(new Date().getTime());
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutorefresh] = useState(true);
  const [refreshTime, setRefreshTime] = useState(15);

  function fetchData() {
    setLoading(true);
    api.get('/api/devices').then((response) => {
      const formatted = response.data.data.map(device => {
        // todo: find a better way to handle this on backend
        const latestMetrics = device.latest_metrics.slice(0, 100).reverse().reduce((acc, metric) => {
          Object.keys(metric.values || {}).forEach(v => {
            if (!Array.isArray(acc[v])) {
              acc[v] = [];
            }

            const date = new Date(metric.date * 1000);
            if (v in metric.values) {
              acc[v].push({ date: `${pad2(date.getHours())}:${pad2(date.getMinutes())}`, value: metric.values[v] })
            }
          });

          return acc;
        }, {});

        return { ...device, latest_metrics: latestMetrics };
      });
      setDevices(formatted);
      setLastReload(new Date());
    }).catch(console.log)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData();
  }, [forceRefresh]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }
    const interval = setInterval(() => {
      fetchData()
    }, refreshTime * 1000);
    return () => clearInterval(interval);
  }, [forceRefresh, autoRefresh, refreshTime]);

  function handleRefresh() {
    setForceRefresh(new Date().getTime());
  }

  function handleRefreshTime(e, value) {
    setRefreshTime(value);
  }

  return (
    <>
      <div className={classes.appBarSpacer} />

      <Container maxWidth="lg" className={classes.container}>

        <Paper className={classes.actions}>
          <div className={classes.refresh}>
            <div className={classes.refreshLabel}>

              Last refresh:{' '}
              {`${lastReload.getHours()}:${lastReload.getMinutes()}:${lastReload.getSeconds()}`}
              {loading && <div className={classes.loader}><CircularProgress size={30} /></div>}
            </div>
            <div>
              Auto refresh
<Checkbox checked={autoRefresh} onChange={() => setAutorefresh(v => !v)} />
              <Button onClick={handleRefresh}><RefreshIcon /></Button>
            </div>
          </div>
          <div>
            Refresh every (seconds)
          <Slider
              value={refreshTime}
              aria-labelledby="discrete-slider"
              valueLabelDisplay="auto"
              step={5}
              marks
              min={5}
              max={60}
              onChange={handleRefreshTime}
            />
          </div>
        </Paper>
        <Grid container spacing={3}>
          {devices.map(device => {
            return Object.keys(device.latest_metrics).map(key => (
              <Chart key={`${device.id}_${key}`} id={device.id} title={device.name} theme={theme} data={device.latest_metrics[key]} label={device.variables.find(v => v.name === key).label} fixedHeightPaper={fixedHeightPaper} />
            ))
          })}
        </Grid>
        <Paper className={classes.actions}>
          {devices.length > 0 && <Map devices={devices} />}
        </Paper>
      </Container>
    </ >
  )
}


function Chart({ data, label, fixedHeightPaper, theme, title, id }) {
  return (

    <Grid item xs={6} md={6} lg={6}>
      <Paper className={fixedHeightPaper}>
        <Link href={`/devices/${id}`}>
          <a>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              {title}
            </Typography>
          </a>
        </Link>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 16,
              right: 16,
              bottom: 0,
              left: 24,
            }}
          >
            <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary}>
              <Label
                angle={270}
                position="left"
                style={{ textAnchor: 'middle', fill: theme.palette.text.primary }}
              >
                {label}
              </Label>
            </YAxis>
            <Line type="monotone" dataKey="value" stroke={theme.palette.primary.main} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>
  );
}

export default withAuth(Home);