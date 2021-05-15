import React from 'react';
import {
    Modal,
    TextField,
    Button
} from '@material-ui/core';
import { Formik, Field, Form, FieldArray, getIn } from 'formik';
import { generate } from "shortid";
import { makeStyles } from '@material-ui/core/styles';
import { Delete } from '@material-ui/icons';
import api from '../api';

const useStyles = makeStyles((theme) => ({
    root: {
        height: 300,
        flexGrow: 1,
        minWidth: 500,
        width: 500,
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
        width: 600,
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(2, 4, 3),
    },
    variable: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        '& > *:first-child': {
            marginRight: theme.spacing()
        }
    },
    delete: {
    },
    create: {
        marginTop: theme.spacing()
    }
}));

const Input = ({ field, form: { errors }, placeholder }) => {
    const errorMessage = getIn(errors, field.name);

    return (
        <>
            <TextField margin="normal"
                fullWidth variant="outlined" {...field} placeholder={placeholder} />
            {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
        </>
    );
};

const initialValues = {
    name: '',
    variables: [{ id: generate(), name: '', label: '', }],
    lat: '',
    long: '',
};

export default function ManageDevice(props) {
    const isCreate = !props.device;
    const classes = useStyles();

    function updateDevice(values, setFieldError) {
        api.patch(`/api/devices/${props.device.id}`, values).then(response => {
            props.handleClose('update', response.data.data)
        }).catch(
            err => {
                const errors = err?.response?.data?.errors;
                handleError(errors, setFieldError);
            }
        )
    }

    function createDevice(values, setFieldError) {
        api.post('/api/devices', values).then(response => {
            props.handleClose('create', response.data.data)
        }).catch(err => {
            const errors = err?.response?.data?.errors;
            handleError(errors, setFieldError);
        })
    }

    function handleError(errors, setFieldError) {
        if (!errors) {
            return;
        }
        Object.keys(errors).forEach(key => setFieldError(key, errors[key]));
    }

    return (
        <div className={classes.root}>
            <Modal
                open={props.open}
                className={classes.modal}
                onClose={() => props.handleClose('close')}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div
                    className={classes.paper}
                >
                    <Formik
                        initialValues={isCreate ? initialValues : props.device}
                        onSubmit={(values, { setFieldError, resetForm }) => {
                            if (isCreate) {
                                createDevice(values, setFieldError);
                            }

                            if (!isCreate) {
                                updateDevice(values, setFieldError);
                            }
                        }}
                    >
                        {({ values, errors }) => (
                            <Form>
                                <Field name="name" placeholder="Device name" component={Input} />
                                <Field name="lat" placeholder="Latitude" component={Input} />
                                <Field name="long" placeholder="Longitude" component={Input} />
                                <FieldArray name="variables">
                                    {({ push, remove }) => (
                                        <div>
                                            {values.variables.map((v, index) => {
                                                return (
                                                    <div key={v.id} className={classes.variable}>
                                                        <Field
                                                            name={`variables[${index}].name`}
                                                            component={Input}
                                                            placeholder="Name"
                                                        />
                                                        <Field
                                                            name={`variables[${index}].label`}
                                                            component={Input}
                                                            placeholder="Label"
                                                        />
                                                        <Button className={classes.delete} onClick={() => remove(index)}><Delete /></Button>
                                                    </div>
                                                );
                                            })}
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    push({ id: generate(), name: "", label: "" })
                                                }
                                                color="primary"
                                                variant="outlined"
                                            >
                                                Add new variable
                                            </Button>
                                        </div>
                                    )}
                                </FieldArray>

                                <Button className={classes.create} variant="contained" color="primary" type="submit">{isCreate ? 'Create' : 'Update'} device</Button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Modal>
        </div>

    )
}