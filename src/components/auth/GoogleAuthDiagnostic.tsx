'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: any;
}

export function GoogleAuthDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runDiagnostics = async () => {
    setTesting(true);
    clearResults();

    // 1. Check Firebase Configuration
    addResult({
      test: 'Firebase Configuration',
      status: 'info',
      message: 'Checking Firebase configuration...'
    });

    try {
      const config = auth.app.options;
      if (!config.apiKey) {
        addResult({
          test: 'Firebase API Key',
          status: 'error',
          message: 'Firebase API Key is missing',
          details: config
        });
      } else {
        addResult({
          test: 'Firebase API Key',
          status: 'success',
          message: 'Firebase API Key is present',
          details: { apiKey: config.apiKey?.substring(0, 10) + '...' }
        });
      }

      if (!config.authDomain) {
        addResult({
          test: 'Firebase Auth Domain',
          status: 'error',
          message: 'Firebase Auth Domain is missing',
          details: config
        });
      } else {
        addResult({
          test: 'Firebase Auth Domain',
          status: 'success',
          message: `Auth Domain: ${config.authDomain}`,
          details: { authDomain: config.authDomain }
        });
      }

      if (!config.projectId) {
        addResult({
          test: 'Firebase Project ID',
          status: 'error',
          message: 'Firebase Project ID is missing',
          details: config
        });
      } else {
        addResult({
          test: 'Firebase Project ID',
          status: 'success',
          message: `Project ID: ${config.projectId}`,
          details: { projectId: config.projectId }
        });
      }
    } catch (error) {
      addResult({
        test: 'Firebase Configuration',
        status: 'error',
        message: 'Failed to read Firebase configuration',
        details: error
      });
    }

    // 2. Check Current Domain
    addResult({
      test: 'Current Domain',
      status: 'info',
      message: `Current domain: ${window.location.hostname}`,
      details: {
        hostname: window.location.hostname,
        origin: window.location.origin,
        protocol: window.location.protocol
      }
    });

    // 3. Check if domain is authorized
    const authDomain = auth.app.options.authDomain;
    if (authDomain && !window.location.hostname.includes(authDomain.replace('.firebaseapp.com', ''))) {
      addResult({
        test: 'Domain Authorization',
        status: 'warning',
        message: 'Current domain may not be authorized in Firebase Console',
        details: {
          currentDomain: window.location.hostname,
          authDomain: authDomain,
          suggestion: 'Add this domain to Firebase Console > Authentication > Settings > Authorized domains'
        }
      });
    } else {
      addResult({
        test: 'Domain Authorization',
        status: 'success',
        message: 'Domain appears to be authorized'
      });
    }

    // 4. Test Google Provider Creation
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      addResult({
        test: 'Google Provider',
        status: 'success',
        message: 'Google Auth Provider created successfully',
        details: { scopes: ['email', 'profile'] }
      });
    } catch (error) {
      addResult({
        test: 'Google Provider',
        status: 'error',
        message: 'Failed to create Google Auth Provider',
        details: error
      });
    }

    // 5. Check for popup blockers
    try {
      const popup = window.open('', '_blank', 'width=1,height=1');
      if (popup) {
        popup.close();
        addResult({
          test: 'Popup Blocker',
          status: 'success',
          message: 'Popups are allowed'
        });
      } else {
        addResult({
          test: 'Popup Blocker',
          status: 'warning',
          message: 'Popups may be blocked by browser'
        });
      }
    } catch (error) {
      addResult({
        test: 'Popup Blocker',
        status: 'warning',
        message: 'Unable to test popup blocker',
        details: error
      });
    }

    // 6. Check redirect result
    try {
      const redirectResult = await getRedirectResult(auth);
      if (redirectResult) {
        addResult({
          test: 'Redirect Result',
          status: 'success',
          message: 'Found redirect result from previous attempt',
          details: { user: redirectResult.user?.email }
        });
      } else {
        addResult({
          test: 'Redirect Result',
          status: 'info',
          message: 'No pending redirect result'
        });
      }
    } catch (error) {
      addResult({
        test: 'Redirect Result',
        status: 'error',
        message: 'Error checking redirect result',
        details: error
      });
    }

    setTesting(false);
  };

  const testPopupSignIn = async () => {
    addResult({
      test: 'Popup Sign-In Test',
      status: 'info',
      message: 'Testing popup sign-in...'
    });

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      addResult({
        test: 'Popup Sign-In Test',
        status: 'success',
        message: 'Popup sign-in successful!',
        details: {
          user: result.user?.email,
          uid: result.user?.uid
        }
      });
    } catch (error: any) {
      addResult({
        test: 'Popup Sign-In Test',
        status: 'error',
        message: `Popup sign-in failed: ${error.message}`,
        details: {
          code: error.code,
          message: error.message
        }
      });
    }
  };

  const testRedirectSignIn = async () => {
    addResult({
      test: 'Redirect Sign-In Test',
      status: 'info',
      message: 'Initiating redirect sign-in...'
    });

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      await signInWithRedirect(auth, provider);
      // This will redirect, so we won't reach this point
    } catch (error: any) {
      addResult({
        test: 'Redirect Sign-In Test',
        status: 'error',
        message: `Redirect sign-in failed: ${error.message}`,
        details: {
          code: error.code,
          message: error.message
        }
      });
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '•';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Google Authentication Diagnostic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={runDiagnostics} disabled={testing}>
            {testing ? 'Running Diagnostics...' : 'Run Diagnostics'}
          </Button>
          <Button onClick={testPopupSignIn} variant="outline">
            Test Popup Sign-In
          </Button>
          <Button onClick={testRedirectSignIn} variant="outline">
            Test Redirect Sign-In
          </Button>
          <Button onClick={clearResults} variant="ghost">
            Clear Results
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span>{getStatusIcon(result.status)}</span>
                  <span className="font-medium">{result.test}</span>
                </div>
                <p className={`mt-1 ${getStatusColor(result.status)}`}>
                  {result.message}
                </p>
                {result.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-500">
                      Show details
                    </summary>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
