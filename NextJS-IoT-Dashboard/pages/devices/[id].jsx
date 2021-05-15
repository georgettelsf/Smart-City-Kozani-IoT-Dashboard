import React, { useEffect, useState } from 'react';
import api from '../../api';
import { makeStyles } from '@material-ui/core/styles';
import withAuth from '../../components/withAuth';
import { useRouter } from 'next/router'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    CircularProgress
} from '@material-ui/core';
import { Delete } from '@material-ui/icons';

import { Pagination } from '@material-ui/lab';

const useStyles = makeStyles({
    container: {
        marginTop: 100,
    },
    table: {
        minWidth: 650,
    },
    pagination: {
        margin: "20px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

    }
});

function Metrics() {
    const [device, setDevice] = React.useState({ variables: [] });
    const [metrics, setMetrics] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [pages, setPages] = React.useState(0);
    const [loading, setLoading] = React.useState(false);

    const router = useRouter();
    const { id } = router.query;
    const classes = useStyles();

    useEffect(() => {
        setLoading(true);
        api
            .get(`/api/devices/${id}`).then((response) => {
                setDevice(response.data.data);
            })
            .catch(console.log)
            .finally(() => setLoading(false));
    }, [page]);

    useEffect(() => {
        setLoading(true);
        api
            .get(`/api/metrics/${id}?page=${page}`).then((response) => {
                setPage(response.data.meta.current_page);
                setPages(Math.ceil(response.data.meta.total / 15))
                setMetrics(response.data.data.map(m => ({ ...m, date: new Date(m.date * 1000) })))
            })
            .catch(console.log)
            .finally(() => setLoading(false));
    }, [page]);

    function handlePageChange(event, value) {
        setPage(value)
    }

    function deleteAll() {
        api.delete(`/api/metrics/${id}`).then((response) => {
            setPage(1);
            setPages(0)
            setMetrics([])
        }).catch(console.log)
    }

    return (
        <div className={classes.container}>
            <Paper className={classes.refresh}>
                {loading && <div className={classes.loader}><CircularProgress size={30} /></div>}
                {metrics.length > 0 && <Button variant="outlined" style={{ color: 'tomato', float: 'right' }} onClick={deleteAll}><Delete /></Button>}
            </Paper>
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            {device?.variables.map(variable => <TableCell key={variable.id}>{variable.label}</TableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {metrics.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{`${row.date.toDateString()} ${row.date.getHours()}:${row.date.getMinutes()}`}</TableCell>
                                {Object.keys(row.values || {}).map((key, index) => (<TableCell key={`${row.id}_${index}`}>{row.values[key]}</TableCell>))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <div className={classes.pagination}>
                {pages > 1 && <Pagination count={pages} page={page} onChange={handlePageChange} />}
            </div>
        </div >
    );
}

export default withAuth(Metrics);