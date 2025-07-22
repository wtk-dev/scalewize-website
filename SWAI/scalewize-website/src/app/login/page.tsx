'use client';
export const dynamic = "force-dynamic";

import React, { Suspense } from 'react';
import LoginPageInner from './LoginPageInner';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageInner />
    </Suspense>
  );
} 