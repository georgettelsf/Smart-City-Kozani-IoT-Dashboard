import React, { useEffect, useState } from 'react';
import api from '../../api';
import { makeStyles } from '@material-ui/core/styles';
import { Edit, Delete, Code, Map } from '@material-ui/icons';
import withAuth from '../../components/withAuth';
import Pagination from '@material-ui/lab/Pagination';
import dynamic from 'next/dynamic'
import Link from 'next/link';

import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@material-ui/core';
import ManageDevice from '../../components/ManageDevice';
import GenerateCode from '../../components/GenerateCode';
const DeviceLocation = dynamic(() => import('../../components/DeviceLocation'), { ssr: false });

const useStyles = makeStyles(theme => ({
    container: {
        marginTop: 20,
        padding: `0 ${theme.spacing(3)}px`
    },
    table: {
        minWidth: 650,
    },
    appBarSpacer: theme.mixins.toolbar,
}));

function Devices() {
    const [devices, setDevices] = React.useState([]);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [editDevice, setEditDevice] = useState(null);
    const [selectedMapDevice, setSelectedMapDevice] = useState(null);

    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);

    const classes = useStyles();
    useEffect(() => {
        api.get(`/api/devices?page=${page}`).then((response) => {
            setPage(response.data.meta.current_page);
            setPages(Math.ceil(response.data.meta.total / 20));
            setDevices(response.data.data);
        }).catch(console.log)
    }, [page]);

    function handlePageChange(event, value) {
        setPage(value)
    }

    function handleClose(mode, values) {
        if (mode === 'create') {
            setCreateModalOpen(false);
            setDevices([values, ...devices]);
        }

        if (mode === 'update') {
            setEditDevice(null);
            const updatedDevices = devices.map(d => {
                if (d.id === values.id) {
                    return values;
                }

                return d;
            })
            setDevices(updatedDevices);
        }

        if (mode === 'close') {
            setEditDevice(null);
            setCreateModalOpen(false);
        }
    }

    return (
        <>
            <div className={classes.appBarSpacer} />

            <div className={classes.container}>

                <Button variant="contained" color="primary" onClick={() => { setCreateModalOpen(true) }}>Create new device</Button>
                <TableContainer component={Paper}>
                    <Table className={classes.table} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Token</TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {devices.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell component="th">
                                        <Link href={`/devices/${row.id}`}>
                                            {row.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell >{row.token}</TableCell>
                                    <TableCell align="right">
                                        <Button onClick={() => {
                                            setSelectedDevice(row)
                                        }}><Code /></Button>
                                        <Button onClick={() => {
                                            setSelectedMapDevice(row)
                                        }}><Map /></Button>
                                        <Button onClick={() => {
                                            setEditDevice(row);
                                        }}><Edit /> </Button>
                                        <Button onClick={() => {
                                            api.delete('/api/devices/' + row.id).then(() => {
                                                setDevices(devices => devices.filter(device => device.id !== row.id));
                                            })
                                        }}><Delete /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {pages > 1 && <Pagination count={pages} page={page} onChange={handlePageChange} />}
                </TableContainer>
                {createModalOpen && <ManageDevice open={createModalOpen} handleClose={handleClose} />}
                {editDevice && <ManageDevice open={editDevice} device={editDevice} handleClose={handleClose} />}
                {selectedDevice && <GenerateCode open={selectedDevice} handleClose={() => setSelectedDevice(null)} />}
                {selectedMapDevice && <DeviceLocation open={selectedMapDevice} handleClose={() => setSelectedMapDevice(null)} />}
            </div >
        </>
    );
}

export default withAuth(Devices);