import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { mockAuthService } from '@/services/mockAuthService';
import { useAuth } from '../context/AuthContext';
import type { LoginRequest } from '@/types/auth.types';

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: LoginRequest) => mockAuthService.login(data),
    onSuccess: (response) => {
      login(response.user, response.token);
      navigate('/inbox');
    },
  });
};
