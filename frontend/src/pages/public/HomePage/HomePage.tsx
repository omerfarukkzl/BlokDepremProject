import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  TruckIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
} from '../../../components';
import { ROUTES } from '../../../constants';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary-600">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-primary-600 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">{t('home.hero.title.line1')}</span>{' '}
                  <span className="block text-primary-200 xl:inline">{t('home.hero.title.line2')}</span>
                </h1>
                <p className="mt-3 text-base text-primary-200 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  {t('home.hero.subtitle')}
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link to={ROUTES.NEEDS}>
                      <Button size="lg" className="w-full">
                        {t('home.hero.buttons.viewNeeds')}
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                    <Link to={ROUTES.TRACK}>
                      <Button variant="outline" size="lg" className="text-primary-200 border-primary-300 hover:bg-primary-50 hover:text-primary-300 w-full">
                        {t('home.hero.buttons.trackShipment')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-primary-500 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <ShieldCheckIcon className="h-32 w-32 text-primary-300 opacity-50" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <Container>
          <div className="lg:text-center">
            <h2 className="text-base font-semibold tracking-wide uppercase text-primary-600">
              {t('home.features.subtitle')}
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {t('home.features.title')}
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              {t('home.features.description')}
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <TruckIcon className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  {t('home.features.items.tracking.title')}
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  {t('home.features.items.tracking.description')}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <ClipboardDocumentListIcon className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  {t('home.features.items.needs.title')}
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  {t('home.features.items.needs.description')}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <MagnifyingGlassIcon className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  {t('home.features.items.shipmentTracking.title')}
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  {t('home.features.items.shipmentTracking.description')}
                </p>
              </div>

              {/* Feature 4 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <GlobeAltIcon className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  {t('home.features.items.ai.title')}
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  {t('home.features.items.ai.description')}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Stats Section */}
      <div className="bg-primary-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
        <Container>
          <div className="max-w-7xl mx-auto lg:text-center">
            <h2 className="text-base font-semibold tracking-wide uppercase text-primary-600">
              {t('home.stats.subtitle')}
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {t('home.stats.title')}
            </p>
          </div>
          <div className="mt-12 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <ClockIcon className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      {t('home.stats.items.realtime.title')}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      {t('home.stats.items.realtime.description')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <ShieldCheckIcon className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      {t('home.stats.items.secure.title')}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      {t('home.stats.items.secure.description')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <TruckIcon className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      {t('home.stats.items.effective.title')}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      {t('home.stats.items.effective.description')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <GlobeAltIcon className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      {t('home.stats.items.transparent.title')}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      {t('home.stats.items.transparent.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <Container size="lg">
          <div className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                {t('home.cta.title')}
              </h2>
              <p className="mt-4 text-xl text-primary-200">
                {t('home.cta.subtitle')}
              </p>
              <div className="mt-8 flex justify-center">
                <div className="inline-flex rounded-md shadow">
                  <Link to={ROUTES.REGISTER}>
                    <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-50">
                      {t('home.cta.buttons.register')}
                    </Button>
                  </Link>
                </div>
                <div className="ml-3 inline-flex">
                  <Link to={ROUTES.NEEDS}>
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                      {t('home.cta.buttons.viewNeeds')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default HomePage;