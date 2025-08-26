'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/safe-providers';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  EnvelopeIcon,
  PhotoIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
}

export default function AuthTestSuite() {
  const { user, userProfile, signIn, signUp, signInWithGoogle, logout } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('test123456');

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runFullAuthTest = async () => {
    setIsRunning(true);
    clearResults();

    try {
      // Test 1: Check Firebase Configuration
      addTestResult({
        name: 'Firebase Configuration',
        status: 'pending',
        message: 'Checking Firebase configuration...'
      });

      // Test 2: Google Sign-In Test
      addTestResult({
        name: 'Google Sign-In Test',
        status: 'pending',
        message: 'Testing Google authentication...'
      });

      try {
        await signInWithGoogle();
        addTestResult({
          name: 'Google Sign-In Test',
          status: 'success',
          message: 'Google sign-in successful',
          details: {
            email: user?.email,
            displayName: user?.displayName,
            photoURL: user?.photoURL
          }
        });
      } catch (error: any) {
        addTestResult({
          name: 'Google Sign-In Test',
          status: 'error',
          message: `Google sign-in failed: ${error.message}`,
          details: error
        });
      }

      // Test 3: User Profile Creation/Update
      if (user) {
        addTestResult({
          name: 'User Profile Test',
          status: 'success',
          message: 'User profile loaded successfully',
          details: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            profileData: userProfile
          }
        });
      }

      // Test 4: Logout Test
      addTestResult({
        name: 'Logout Test',
        status: 'pending',
        message: 'Testing logout functionality...'
      });

      try {
        await logout();
        addTestResult({
          name: 'Logout Test',
          status: 'success',
          message: 'Logout successful'
        });
      } catch (error: any) {
        addTestResult({
          name: 'Logout Test',
          status: 'error',
          message: `Logout failed: ${error.message}`,
          details: error
        });
      }

    } catch (error: any) {
      addTestResult({
        name: 'Test Suite Error',
        status: 'error',
        message: `Test suite failed: ${error.message}`,
        details: error
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testEmailSignIn = async () => {
    try {
      await signIn(testEmail, testPassword);
      addTestResult({
        name: 'Email Sign-In Test',
        status: 'success',
        message: 'Email sign-in successful'
      });
    } catch (error: any) {
      addTestResult({
        name: 'Email Sign-In Test',
        status: 'error',
        message: `Email sign-in failed: ${error.message}`
      });
    }
  };

  const testEmailSignUp = async () => {
    try {
      await signUp(testEmail, testPassword, 'Test User');
      addTestResult({
        name: 'Email Sign-Up Test',
        status: 'success',
        message: 'Email sign-up successful'
      });
    } catch (error: any) {
      addTestResult({
        name: 'Email Sign-Up Test',
        status: 'error',
        message: `Email sign-up failed: ${error.message}`
      });
    }
  };

  const testGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      addTestResult({
        name: 'Google Sign-In Test',
        status: 'success',
        message: 'Google sign-in successful',
        details: {
          email: user?.email,
          displayName: user?.displayName,
          photoURL: user?.photoURL
        }
      });
    } catch (error: any) {
      addTestResult({
        name: 'Google Sign-In Test',
        status: 'error',
        message: `Google sign-in failed: ${error.message}`
      });
    }
  };

  const testLogout = async () => {
    try {
      await logout();
      addTestResult({
        name: 'Logout Test',
        status: 'success',
        message: 'Logout successful'
      });
    } catch (error: any) {
      addTestResult({
        name: 'Logout Test',
        status: 'error',
        message: `Logout failed: ${error.message}`
      });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Authentication Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing for Google OAuth and email authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current User Status */}
          {user ? (
            <Alert>
              <UserIcon className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div><strong>Logged in as:</strong> {user.email}</div>
                  <div><strong>Display Name:</strong> {user.displayName || 'Not set'}</div>
                  <div><strong>UID:</strong> {user.uid}</div>
                  {user.photoURL && (
                    <div className="flex items-center gap-2">
                      <strong>Photo:</strong>
                      <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>No user currently logged in</AlertDescription>
            </Alert>
          )}

          {/* Test Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input
                placeholder="Test Email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Test Password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Button onClick={testEmailSignIn} className="w-full" variant="outline">
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Test Email Sign-In
              </Button>
              <Button onClick={testEmailSignUp} className="w-full" variant="outline">
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Test Email Sign-Up
              </Button>
              <Button onClick={testGoogleSignIn} className="w-full" variant="outline">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Test Google Sign-In
              </Button>
            </div>
          </div>

          {/* Main Test Button */}
          <div className="flex gap-2">
            <Button 
              onClick={runFullAuthTest} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? 'Running Tests...' : 'Run Full Authentication Test'}
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
            {user && (
              <Button onClick={logout} variant="destructive">
                <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.name}</span>
                      <Badge variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}>
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">Show Details</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
