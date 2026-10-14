import { useCallback, useMemo, useState } from 'react';
import { useAvailability } from '../useAvailability.js';
import {
  USERNAME_RE,
  EMAIL_RE,
  PHONE_RE,
  INITIAL_REGISTER_FORM,
} from '../lib/validationConstants.js';

/**
 * Hook para manejar el estado del formulario de registro.
 * Incluye validaciones y verificación de disponibilidad.
 */
export function useRegisterForm() {
  const [form, setForm] = useState(INITIAL_REGISTER_FORM);
  const [touched, setTouched] = useState({});

  const validateUsername = useCallback((v) => USERNAME_RE.test(v), []);
  const validateEmail = useCallback((v) => EMAIL_RE.test(v), []);
  const validatePhone = useCallback((v) => PHONE_RE.test(v), []);

  const usernameStatus = useAvailability('username', form.username, {
    validate: validateUsername,
  });
  const emailStatus = useAvailability('email', form.email, {
    validate: validateEmail,
  });
  const phoneStatus = useAvailability('phone', form.phone, {
    validate: validatePhone,
  });

  const hasContact = form.email.trim() || form.phone.trim();
  const passwordsMatch = form.password && form.password === form.confirmPassword;

  const canVerifyByEmail = form.email.trim() && emailStatus !== 'taken' && emailStatus !== 'invalid';
  const canVerifyBySms = form.phone.trim() && phoneStatus !== 'taken' && phoneStatus !== 'invalid';

  const verifyOptions = useMemo(() => {
    const opts = [];
    if (canVerifyByEmail) opts.push({ id: 'email', label: 'Email' });
    if (canVerifyBySms) opts.push({ id: 'sms', label: 'SMS' });
    opts.push({ id: 'discord', label: 'Discord' });
    return opts;
  }, [canVerifyByEmail, canVerifyBySms]);

  const isFormValid =
    USERNAME_RE.test(form.username) &&
    usernameStatus === 'available' &&
    hasContact &&
    (!form.email.trim() || (EMAIL_RE.test(form.email) && emailStatus !== 'taken')) &&
    (!form.phone.trim() || (PHONE_RE.test(form.phone) && phoneStatus !== 'taken')) &&
    form.password.length >= 6 &&
    passwordsMatch &&
    form.acceptTerms;

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const markTouched = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const markAllTouched = useCallback(() => {
    setTouched({
      username: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      acceptTerms: true,
    });
  }, []);

  return {
    form,
    touched,
    usernameStatus,
    emailStatus,
    phoneStatus,
    hasContact,
    passwordsMatch,
    verifyOptions,
    isFormValid,
    updateField,
    markTouched,
    markAllTouched,
  };
}
