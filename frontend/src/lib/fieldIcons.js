import React from 'react';
import {
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  Hash,
  Upload,
  Image as ImageIcon,
  List,
  CheckSquare,
  Radio,
  MessageSquare,
  Globe,
  Building2,
  Lock,
  Clock,
  AlignLeft,
  Type,
  FileText,
  HelpCircle,
} from 'lucide-react';

/**
 * Catalog of icons available for creators to select in the field editor
 */
export const AVAILABLE_FIELD_ICONS = [
  { id: 'auto', label: 'Auto-detect (Smart)', icon: HelpCircle },
  { id: 'UserRound', label: 'Person / Name', icon: UserRound },
  { id: 'Mail', label: 'Email', icon: Mail },
  { id: 'Phone', label: 'Phone / Mobile', icon: Phone },
  { id: 'CalendarDays', label: 'Date / Calendar', icon: CalendarDays },
  { id: 'MapPin', label: 'Location / Address', icon: MapPin },
  { id: 'Hash', label: 'Number / Count', icon: Hash },
  { id: 'Upload', label: 'Upload / Document', icon: Upload },
  { id: 'Image', label: 'Photo / Image', icon: ImageIcon },
  { id: 'List', label: 'Dropdown / Select', icon: List },
  { id: 'CheckSquare', label: 'Checkboxes', icon: CheckSquare },
  { id: 'Radio', label: 'Radio Choice', icon: Radio },
  { id: 'MessageSquare', label: 'Message / Notes', icon: MessageSquare },
  { id: 'AlignLeft', label: 'Paragraph / Bio', icon: AlignLeft },
  { id: 'Globe', label: 'Website / Link', icon: Globe },
  { id: 'Building2', label: 'Company / Org', icon: Building2 },
  { id: 'Lock', label: 'Password / Private', icon: Lock },
  { id: 'Clock', label: 'Time / Hours', icon: Clock },
  { id: 'Type', label: 'General Text', icon: Type },
  { id: 'none', label: 'None (No Icon)', icon: null },
];

const ICON_MAP = {
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  Hash,
  Upload,
  Image: ImageIcon,
  List,
  CheckSquare,
  Radio,
  MessageSquare,
  AlignLeft,
  Globe,
  Building2,
  Lock,
  Clock,
  Type,
  FileText,
};

/**
 * Automatically suggests a suitable Lucide React icon based on label keywords and field type
 */
export const detectFieldIcon = (label = '', type = 'text') => {
  const text = String(label).toLowerCase().trim();

  // Keyword rules based on label
  if (/\b(name|full\s*name|first\s*name|last\s*name|username|author|contact\s*person|recipient|attendee|candidate)\b/i.test(text)) {
    return UserRound;
  }
  if (/\b(email|e-mail|mail)\b/i.test(text)) {
    return Mail;
  }
  if (/\b(phone|mobile|tel|cell|whatsapp|fax|contact\s*number)\b/i.test(text)) {
    return Phone;
  }
  if (/\b(date|birth|birthday|dob|schedule|deadline|due|event|appointment|anniversary|year)\b/i.test(text)) {
    return CalendarDays;
  }
  if (/\b(address|location|city|state|country|zip|postal|street|residence|destination|venue)\b/i.test(text)) {
    return MapPin;
  }
  if (/\b(company|organization|institution|school|university|business|employer|workplace)\b/i.test(text)) {
    return Building2;
  }
  if (/\b(website|url|link|portfolio|profile|github|linkedin|social)\b/i.test(text)) {
    return Globe;
  }
  if (/\b(number|age|quantity|amount|count|price|salary|budget|rate|score|experience|years|total|qty)\b/i.test(text)) {
    return Hash;
  }
  if (/\b(image|photo|picture|avatar|headshot|logo|banner|screenshot)\b/i.test(text)) {
    return ImageIcon;
  }
  if (/\b(file|document|resume|cv|attachment|portfolio\s*file|upload|pdf)\b/i.test(text)) {
    return Upload;
  }
  if (/\b(message|comment|feedback|notes|bio|summary|description|about|query|reason|details)\b/i.test(text)) {
    return MessageSquare;
  }
  if (/\b(password|secret|pin|passcode)\b/i.test(text)) {
    return Lock;
  }
  if (/\b(time|hour|timing|duration|shift)\b/i.test(text)) {
    return Clock;
  }

  // Fallback to field type
  switch (type) {
    case 'email':
      return Mail;
    case 'number':
      return Hash;
    case 'date':
      return CalendarDays;
    case 'file':
      return Upload;
    case 'select':
      return List;
    case 'radio':
      return Radio;
    case 'checkbox':
      return CheckSquare;
    case 'textarea':
      return AlignLeft;
    case 'text':
    default:
      return Type;
  }
};

/**
 * Returns the resolved icon component for a given field
 */
export const getFieldIconComponent = (field) => {
  if (!field) return Type;

  // Custom icon override stored in field.options.icon or field.icon
  const explicitIcon = field.options?.icon || field.icon;

  if (explicitIcon === 'none') {
    return null;
  }

  if (explicitIcon && explicitIcon !== 'auto' && ICON_MAP[explicitIcon]) {
    return ICON_MAP[explicitIcon];
  }

  return detectFieldIcon(field.label, field.type);
};
