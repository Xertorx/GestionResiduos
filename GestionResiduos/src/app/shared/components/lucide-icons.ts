
import {
  Trash2, ChevronLeft, ChevronRight, LogOut, Menu, Bell, ChevronDown, ChevronUp,
  User, Shield, MessageSquare, MessageCircle, LogIn, Chrome, UserPlus,
  Users, MapPin, Clock, Award, Map, Calendar, AlertTriangle,
  BookOpen, TrendingUp, Download, FileText, Video, Image,
  ThumbsUp, ThumbsDown, Facebook, Twitter, Instagram, Youtube,
  Send, Home, Folder, Settings, BarChart2, Leaf, RefreshCw,
  CircleCheckBig, CircleAlert, XCircle, Key, UserCheck, UserX, Edit, Trash, Plus, Minus, Search, Lock, X, Upload, Inbox, CheckCircle,
  Eye, EyeOff, Tag, PieChart, Pencil
} from 'lucide-angular';

export const LUCIDE_ICONS = { 
  Trash2, ChevronLeft, ChevronRight, LogOut, Menu, Bell, ChevronDown, ChevronUp,
  User, Shield, MessageSquare, LogIn, Chrome, UserPlus,
  Users, MapPin, Clock, Award, Map, Calendar, AlertTriangle,
  BookOpen, TrendingUp, Download, FileText, Video, Image,
  ThumbsUp, ThumbsDown, Facebook, Twitter, Instagram, Youtube,
  Send, Home, Folder, Settings, BarChart2, Leaf, RefreshCw,
  CircleCheckBig, CircleAlert, XCircle, Key, UserCheck, UserX, Edit, Trash, Plus, Minus, Search, Lock, X, Upload, Inbox, CheckCircle,
  Eye, EyeOff,
  MessageCircle,Pencil
};

// also expose kebab-case keys used in templates
(
  Object.assign as any
)(LUCIDE_ICONS, {
  'tag': Tag,
  'pie-chart': PieChart,
  'Tag': Tag,
  'PieChart': PieChart
});