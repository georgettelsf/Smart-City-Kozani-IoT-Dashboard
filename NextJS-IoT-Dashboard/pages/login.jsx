import { useState } from 'react';
import Link from 'next/link'
import { logIn } from '../auth'
import { Paper, withStyles, Grid, TextField, Button, Link as MLink, FormControlLabel, Checkbox, Typography } from '@material-ui/core';
import api from '../api';

const styles = theme => ({
    pageWrapper: {
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='12' viewBox='0 0 20 12'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='charlie-brown' fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M9.8 12L0 2.2V.8l10 10 10-10v1.4L10.2 12h-.4zm-4 0L0 6.2V4.8L7.2 12H5.8zm8.4 0L20 6.2V4.8L12.8 12h1.4zM9.8 0l.2.2.2-.2h-.4zm-4 0L10 4.2 14.2 0h-1.4L10 2.8 7.2 0H5.8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    },
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
    input: {
        minWidth: 290
    }
});

function Login({ classes }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    function loginHandler(event) {
        event.preventDefault();
        setError(false);
        api.get('/sanctum/csrf-cookie').then(() => {
            api.post('/login', { email, password })
                .then(logIn)
                .catch((error) => {
                    setError(true);
                });
        });
    }

    return (
        <div className={classes.pageWrapper}>
            <Paper className={classes.maxWidth}>
                <div className={classes.margin}>
                    <form className={classes.form} onSubmit={loginHandler}>
                        <Grid>
                            <Grid item md={true} sm={true} xs={true}>
                                <TextField
                                    className={classes.input}
                                    id="email"
                                    label="Email"
                                    type="email"
                                    fullWidth autoFocus required
                                    error={error}
                                    helperText={error && 'Incorrect credentials.'}
                                    value={email} onChange={(event) => setEmail(event.target.value)} />
                            </Grid>
                        </Grid>
                        <Grid>
                            <Grid item md={true} sm={true} xs={true}>
                                <TextField
                                    error={error}
                                    className={classes.input} id="password" label="Password" type="password" fullWidth required
                                    value={password} onChange={(event) => setPassword(event.target.value)}
                                />
                            </Grid>
                        </Grid>
                        <Grid className={classes.marginTop}>
                            <Button type="submit"
                                fullWidth variant="outlined" color="primary">Login</Button>
                        </Grid>
                        <Link href="/register"><MLink>Register</MLink></Link>
                    </form>
                </div>
            </Paper>
        </div>
    )
}

export default withStyles(styles)(Login);
