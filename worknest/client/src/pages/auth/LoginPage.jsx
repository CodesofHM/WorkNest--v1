// File: worknest/client/src/pages/auth/LoginPage.jsx

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  completeMfaLogin,
  createRecaptchaVerifier,
  getMfaResolver,
  login,
  loginAsGuest,
  resetPassword,
  sendMfaLoginCode,
} from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import BrandLogo from '../../components/layout/BrandLogo';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mfaResolver, setMfaResolver] = useState(null);
  const [mfaVerificationId, setMfaVerificationId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const fromGuestLimit = Boolean(location.state?.fromGuestLimit);
  const { currentUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err?.code === 'auth/multi-factor-auth-required') {
        try {
          const resolver = getMfaResolver(err);
          const verifier = createRecaptchaVerifier('login-recaptcha-container');
          const verificationId = await sendMfaLoginCode({
            resolver,
            hint: resolver.hints[0],
            recaptchaVerifier: verifier,
          });
          setMfaResolver(resolver);
          setMfaVerificationId(verificationId);
          setError('');
        } catch (mfaError) {
          setError(mfaError.message || 'Could not start two-factor verification.');
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!mfaResolver || !mfaVerificationId || !mfaCode.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await completeMfaLogin({
        resolver: mfaResolver,
        verificationId: mfaVerificationId,
        code: mfaCode.trim(),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid two-factor verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email first, then click Forgot Password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setError('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(err.message || 'Could not send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);

    try {
      if (!currentUser?.isAnonymous) {
        await loginAsGuest();
      }
      navigate('/dashboard');
    } catch (err) {
      const isProviderDisabled = err?.code === 'auth/operation-not-allowed';
      setError(isProviderDisabled
        ? 'Guest login is not enabled in Firebase yet. Enable Anonymous sign-in in Firebase Authentication.'
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.1),_transparent_30%),linear-gradient(180deg,_#f8fafc,_#eef2ff)] px-4 py-8 font-sans">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex justify-center">
          <BrandLogo
            stacked
            className="items-center text-center"
            labelClassName="text-center"
            imageClassName="h-16 rounded-3xl shadow-sm"
          />
        </div>
        <Card className="w-full border-slate-200 bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Enter your email below to log in to your account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div id="login-recaptcha-container" />
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="password"  className="text-sm font-medium">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-sky-700 hover:underline"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {mfaResolver ? (
              <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <label htmlFor="mfaCode" className="text-sm font-medium">Two-Factor Code</label>
                <Input
                  id="mfaCode"
                  inputMode="numeric"
                  placeholder="Enter SMS code"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                />
                <Button type="button" onClick={handleVerifyMfa} disabled={loading}>
                  Verify Code
                </Button>
              </div>
            ) : null}
            {error && <p className={`text-sm ${error.includes('sent') ? 'text-emerald-600' : 'text-destructive'}`}>{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging In...' : 'Log In'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full"
              disabled={loading}
              onClick={handleGuestLogin}
            >
              {fromGuestLimit ? 'Back to Guest Mode' : 'Continue as Guest'}
            </Button>
            {fromGuestLimit ? (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                You can return to guest mode, but the guest limits will still apply.
              </p>
            ) : null}
          
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link to="/" className="mr-2 underline">
                Back to Intro
              </Link>
              ·
            </p>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="underline">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
