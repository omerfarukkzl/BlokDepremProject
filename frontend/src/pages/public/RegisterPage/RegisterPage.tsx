import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UserIcon,
  WalletIcon,
  EnvelopeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LoadingSpinner,
  Alert,
  FormField,
  FormSelect,
} from '../../../components';
import { useAuthStore } from '../../../stores';
import { useNotification } from '../../../components';
import { ROUTES } from '../../../constants';
import walletService from '../../../services/walletService';

// Form validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz').optional(),
  locationId: z.string().min(1, 'Lütfen bir lokasyon seçin'),
  walletAddress: z
    .string()
    .min(42, 'Cüzdan adresi 42 karakter olmalıdır')
    .max(42, 'Cüzdan adresi 42 karakter olmalıdır')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Geçersiz cüzdan adresi formatı'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const { showError, showSuccess } = useNotification();

  const [walletConnecting, setWalletConnecting] = useState(false);
  const [signingMessage, setSigningMessage] = useState(false);
  const [walletInfo, setWalletInfo] = useState<any>(null);

  // Mock locations - should come from API
  const mockLocations = [
    { value: '1', label: 'İstanbul - Kadıköy' },
    { value: '2', label: 'İstanbul - Beşiktaş' },
    { value: '3', label: 'Ankara - Çankaya' },
    { value: '4', label: 'İzmir - Konak' },
    { value: '5', label: 'Bursa - Osmangazi' },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const watchedAddress = watch('walletAddress');

  // Connect to wallet
  const handleConnectWallet = async () => {
    try {
      setWalletConnecting(true);
      const info = await walletService.connectWallet();
      setWalletInfo(info);
      setValue('walletAddress', info.address);
      showSuccess('Cüzdan başarıyla bağlandı!', `Bağlı: ${info.address.slice(0, 6)}...${info.address.slice(-4)}`);
    } catch (error) {
      console.error('Wallet connection error:', error);
      showError('Cüzdan Bağlantı Hatası', error instanceof Error ? error.message : 'Cüzdan bağlanırken hata oluştu.');
    } finally {
      setWalletConnecting(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setSigningMessage(true);

      // Create message to sign
      const message = `BlokDeprem kayıt için imza at: ${new Date().toISOString()}`;

      // Sign message
      const signature = await walletService.signMessage(message);

      // Call register API
      await registerUser({
        walletAddress: data.walletAddress,
        name: data.name,
        email: data.email,
        locationId: data.locationId,
        signature,
        message,
      });

      showSuccess('Kayıt Başarılı!', 'BlokDeprem sistemine hoş geldiniz.');

      // Navigate to login or dashboard
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Register error:', error);
      showError('Kayıt Hatası', error instanceof Error ? error.message : 'Kayıt olurken hata oluştu.');
    } finally {
      setSigningMessage(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <UserIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            BlokDeprem Kayıt
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Yardım görevlisi hesabı oluşturun
          </p>
        </div>

        {/* Register Card */}
        <Card>
          <CardHeader>
            <CardTitle>Görevli Kaydı</CardTitle>
            <CardDescription>
              Bilgilerinizi girerek yardım görevlisi hesabı oluşturabilirsiniz
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <FormField
                label="Ad Soyad"
                name="name"
                register={register}
                errors={errors}
                placeholder="Adınız ve soyadınız"
                required
                leftIcon={<UserIcon className="h-4 w-4 text-gray-400" />}
              />

              {/* Email Field */}
              <FormField
                label="E-posta (Opsiyonel)"
                name="email"
                register={register}
                errors={errors}
                type="email"
                placeholder="ornek@email.com"
                leftIcon={<EnvelopeIcon className="h-4 w-4 text-gray-400" />}
              />

              {/* Location Field */}
              <FormSelect
                label="Lokasyon"
                name="locationId"
                register={register}
                errors={errors}
                options={mockLocations}
                required
              />

              {/* Wallet Address Field */}
              <div>
                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700">
                  Cüzdan Adresi
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    {...register('walletAddress')}
                    type="text"
                    id="walletAddress"
                    className="block w-full flex-1 rounded-none rounded-l-md border-gray-300 border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="0x..."
                    disabled={walletConnecting || signingMessage}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={walletConnecting || signingMessage}
                    onClick={handleConnectWallet}
                    className="rounded-l-none rounded-r-md"
                    leftIcon={
                      walletConnecting ? (
                        <LoadingSpinner size="sm" color="gray" />
                      ) : (
                        <WalletIcon className="h-4 w-4" />
                      )
                    }
                  >
                    {walletConnecting ? 'Bağlanıyor...' : 'Bağlan'}
                  </Button>
                </div>
                {errors.walletAddress && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.walletAddress.message}
                  </p>
                )}
              </div>

              {/* Wallet Info Display */}
              {walletInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <WalletIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Cüzdan Bilgileri
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>Adres: {walletInfo.address}</p>
                        <p>Chain ID: {walletInfo.chainId}</p>
                        <p>Bakiye: {parseFloat(walletInfo.balance).toFixed(4)} ETH</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MetaMask Installation Alert */}
              {!walletService.isMetaMaskInstalled() && (
                <Alert variant="warning" showIcon>
                  <div className="mt-2">
                    <p className="text-sm text-yellow-800">
                      MetaMask kurulu değil. Lütfen{' '}
                      <a
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium"
                      >
                        MetaMask'i indirin
                      </a>
                      {' '}ve kurduktan sonra tekrar deneyin.
                    </p>
                  </div>
                </Alert>
              )}

              {/* Terms and Conditions */}
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-xs text-gray-600">
                  Kayıt olarak BlokDeprem'in{' '}
                  <a href="#" className="underline text-primary-600">
                    kullanım koşullarını
                  </a>{' '}
                  ve{' '}
                  <a href="#" className="underline text-primary-600">
                    gizlilik politikasını
                  </a>{' '}
                  kabul etmiş olursunuz.
                </p>
              </div>

              {/* Submit Button */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={!watchedAddress || signingMessage || !walletService.isMetaMaskInstalled()}
                  loading={signingMessage}
                  fullWidth
                  size="lg"
                >
                  {signingMessage ? 'İmzalanıyor...' : 'İmzala ve Kayıt Ol'}
                </Button>

                {signingMessage && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Lütfen MetaMask'taki imza talebini onaylayın...
                    </p>
                  </div>
                )}
              </div>

              {/* Login Link */}
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Zaten hesabınız var mı?{' '}
                  <Link
                    to={ROUTES.LOGIN}
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Giriş yapın
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Cüzdanınız sadece kimlik doğrulama için kullanılır.
            <br />
            Hiçbir işlem yapılmaz veya ücret alınmaz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;