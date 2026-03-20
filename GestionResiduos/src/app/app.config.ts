import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

import {
  LucideAngularModule,
  Trash2,
  ChevronLeft,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  User,
  Shield,
  MessageSquare,
  LogIn,
  Chrome,
  UserPlus,
  Users,
  MapPin,
  Clock,
  Award,
  Map as MapIcon,
  Calendar,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  Download,
  FileText,
  Video,
  Image,
  ThumbsUp,
  ThumbsDown,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Send,
  Home,
  Map,
  Folder,
  Settings,
  BarChart2,
  Leaf,
  RefreshCw,
  CircleCheckBig
} from 'lucide-angular';

// 🎯 Solo los íconos realmente utilizados en tus componentes
const LUCIDE_ICONS_MAP = {
  Trash2,
  ChevronLeft,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  User,
  Shield,
  MessageSquare,
  LogIn,
  Chrome,
  UserPlus,
  Users,
  MapPin,
  Clock,
  Award,
  MapIcon,
  Calendar,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  Download,
  FileText,
  Video,
  Image,
  ThumbsUp,
  ThumbsDown,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Send,
  Home,
  Map,
  Folder,
  Settings,
  BarChart2,
  Leaf,
  RefreshCw,
  CircleCheckBig
};

export const appConfig: ApplicationConfig = {
  providers: [
    // 🔹 Configuración esencial de Angular 20+
    provideZoneChangeDetection({ eventCoalescing: true }),

    // 🔹 Ruteo con configuración básica y confiable
    provideRouter(
      routes,
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
        urlUpdateStrategy: 'eager',
        onSameUrlNavigation: 'reload'
      })
    ),

    // 🔹 Soporte SSR e hidratación
    provideClientHydration(withEventReplay()),

    // 🔹 HTTP moderno con fetch API
    provideHttpClient(withFetch()),

    // 🔹 Íconos Lucide globalmente disponibles
    importProvidersFrom(LucideAngularModule.pick(LUCIDE_ICONS_MAP))
  ]
};
