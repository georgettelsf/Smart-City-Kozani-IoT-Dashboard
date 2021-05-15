import React from 'react';
import {
    Modal,
    Button
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import generate from '../codeGenerator';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';

const useStyles = makeStyles((theme) => ({
    root: {
        height: 300,
        flexGrow: 1,
        minWidth: 300,
        transform: 'translateZ(0)',
        '@media all and (-ms-high-contrast: none)': {
            display: 'none',
        },
    },
    modal: {
        display: 'flex',
        padding: theme.spacing(1),
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        width: 700,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    code: {
        maxHeight: 500,
        overflowY: 'scroll',
        overflowWrap: 'break-word',
    }
}));


export default function GenerateCode(props) {
    const classes = useStyles();

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
    }

    return (
        <div className={classes.root}>
            <Modal
                open={Boolean(props.open)}
                className={classes.modal}
                onClose={props.handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div
                    className={classes.paper}
                >
                    <Button onClick={() => { copyToClipboard(generate(props.open.token, props.open.variables)) }} > <FileCopyOutlinedIcon /></Button>
                    <pre className={classes.code}>
                        {generate(props.open.token, props.open.variables)}
                    </pre>
                </div>
            </Modal>
        </div>

    )
}