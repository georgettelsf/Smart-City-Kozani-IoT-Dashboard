import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { Grid, Paper, withStyles } from '@material-ui/core';
import { useState } from 'react';
import { logIn } from '../auth'

import api from '../api';

const styles = theme => ({
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    maxWidth: {
        maxWidth: 400,
        margin: 'auto',
        padding: theme.spacing(2),
    },
    margin: {
        margin: theme.spacing(2),
    },
    marginTop: {
        marginTop: theme.spacing()
    },
    padding: {
        padding: theme.spacing()
    },
    submit: {
        minWidth: 290
    },
    appBarSpacer: theme.mixins.toolbar,
});

function Profile({ classes }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        api.get('/api/profile')
            .then(({ data: { data: { name, email } } }) => {
                console.log(name, email);
                setName(name);
                setEmail(email);
            }).catch(err => {
                setErrors(err?.response?.data?.errors || {});
            })
    }, []);

    function signUp(event) {
        event.preventDefault();
        api.patch('/api/profile', { name, email, password, password_confirmation: passwordConfirmation, current: currentPassword }).then(response => {
        }).catch(err => {
            setErrors(err?.response?.data?.errors || {});
        })
    }

    return (
        <>
            <div className={classes.appBarSpacer} />

            <div className={classes.pageWrapper}>
                <div className={classes.margin}>
                    <form className={classes.form} onSubmit={signUp}>
                        <Grid >
                            <Grid item md={true} sm={true} xs={true}>
                                <TextField
                                    error={errors?.name}
                                    helperText={errors?.name && errors?.name}

                                    className={classes.submit}
                                    autoComplete="name"
                                    name="name"
                                    fullWidth autoFocus required
                                    id="name"
                                    label="Name"
                                    value={name}
                                    onChange={(event) => {
                                        setName(event.target.value)
                                    }} />
                            </Grid>
                        </Grid>
                        <Grid >
                            <Grid item md={true} sm={true} xs={true}>
                                <TextField
                                    className={classes.submit}
                                    error={errors?.email}
                                    helperText={errors?.email && errors?.email}
                                    fullWidth autoFocus required
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)} />
                            </Grid>
                        </Grid>
                        <Grid >
                            <Grid item md={true} sm={true} xs={true}>
                                <TextField
                                    className={classes.submit}
                                    fullWidth autoFocus required
                                    error={errors?.current}
                                    helperText={errors?.current}
                                    name="current"
                                    label="Current password"
                                    type="password"
                                    id="current"
                                    autoComplete="current"
                                    value={currentPassword}
                                    onChange={(event) => setCurrentPassword(event.target.value)} />
                            </Grid>
                        </Grid>
                        <Grid >
                            <Grid item md={true} sm={true} xs={true}>
                                <TextField
                                    className={classes.submit}
                                    fullWidth autoFocus required
                                    error={errors?.password}
                                    helperText={errors?.password && errors?.password}
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)} />
                            </Grid>
                        </Grid>

                        <Grid >
                            <Grid item md={true} sm={true} xs={true}>
                                <TextField
                                    className={classes.submit}
                                    fullWidth autoFocus required
                                    name="password_confirmation"
                                    label="Confirmation"
                                    type="password"
                                    id="password_confirmation"
                                    autoComplete="current-password"
                                    value={passwordConfirmation}
                                    onChange={(event) => setPasswordConfirmation(event.target.value)} />
                            </Grid>
                        </Grid>
                        <Grid className={classes.marginTop}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="outlined"
                                color="primary"
                                className={classes.submit}
                            >
                                Update
                            </Button>
                        </Grid>
                    </form>
                </div>
            </div >
        </>
    )
}
export default withStyles(styles)(Profile);