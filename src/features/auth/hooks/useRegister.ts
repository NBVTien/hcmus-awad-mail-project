import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuth } from '../context/AuthContext';
import type { RegisterRequest } from '@/types/auth.types';

export const useRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      login(response.user, response.token);
      // Redirect to welcome page for email setup
      navigate('/welcome');
    },
  });
};
