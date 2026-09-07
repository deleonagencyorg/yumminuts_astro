// src/services/api/contact.ts
import { cmsClient } from './client';
import { cmsConfig, withSiteFilter } from './config';

const CRM_REASON_BY_LABEL: Record<string, string> = {
  'Soy cliente': 'Soy cliente',
  'I am a client': 'Soy cliente',
  'Quiero ser cliente': 'Quiero ser cliente',
  'I want to be a client': 'Quiero ser cliente',
  'Exportaciones': 'Exportaciones',
  'Exports': 'Exportaciones',
  'Quiero ser proveedor': 'Quiero ser proveedor', 
  'I want to be a supplier': 'Quiero ser proveedor',
  'Enviar Hoja de vida': 'Enviar Hoja de vida',
  'Send Resume': 'Enviar Hoja de vida',
  'Soy Estudiante Universitario': 'Soy Estudiante Universitario',
  'I am a University Student': 'Soy Estudiante Universitario',
  'Soy Periodista/ Medio de comunicación': 'Soy Periodista/ Medio de comunicación',
  'I am a Journalist/Media': 'Soy Periodista/ Medio de comunicación',
  'Línea Ética YUMMIES': 'Línea Ética YUMMIES',
  'YUMMIES Ethics Line': 'Línea Ética YUMMIES',
  'Soy un ganador': 'Soy un ganador',
  'Otros': 'Otros',
  'Others': 'Otros',
};

export interface ContactFormField {
  label: string;
  placeholder: string;
  required: boolean;
}

export interface ContactReasonOption {
  label: string;
  value: string;
}

export interface ContactFormView {
  title: string;
  contactReason: ContactFormField & { options: ContactReasonOption[] };
  fullName: ContactFormField;
  email: ContactFormField;
  phone: ContactFormField;
  message: ContactFormField;
  submit: string;
}

export interface ContactOfficeView {
  countryCode: string;
  tab: string;
  name: string;
  address: string;
  phones: string[];
  fax?: string;
  email: string;
  mapEmbed: string;
}

export interface ContactPage {
  title: string;
  subtitle: string;
  description: string;
  email: string;
  phone: string;
  form: ContactFormView;
  officesTitle: string;
  offices: ContactOfficeView[];
  map: {
    title: string;
    description: string;
  };
}

interface CmsFormField {
  label?: string;
  placeholder?: string;
  required?: boolean;
}

interface CmsContactConfig {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  email?: string;
  phone?: string;
  form?: {
    title?: string;
    contactReason?: CmsFormField & { options?: string[] };
    fullName?: CmsFormField;
    email?: CmsFormField;
    phone?: CmsFormField;
    message?: CmsFormField;
    submit?: string;
  };
  offices?: {
    title?: string;
    locations?: Array<{
      id?: string;
      countryCode?: string;
      tab?: string;
      name?: string;
      address?: string;
      phones?: string[];
      fax?: string;
      email?: string;
      mapEmbed?: string;
      order?: number;
    }>;
  };
  map?: {
    title?: string;
    description?: string;
  };
}

interface ContactListResponse {
  data: CmsContactConfig[];
}

function text(value?: string): string {
  return value?.trim() || '';
}

function mapField(field?: CmsFormField, requiredDefault = false): ContactFormField {
  return {
    label: text(field?.label),
    placeholder: text(field?.placeholder),
    required: field?.required ?? requiredDefault,
  };
}

function mapReasonOptions(options?: string[]): ContactReasonOption[] {
  return (options ?? [])
    .map((label) => text(label))
    .filter(Boolean)
    .map((label) => ({
      label,
      value: CRM_REASON_BY_LABEL[label] || label,
    }));
}

function mapForm(form?: CmsContactConfig['form']): ContactFormView {
  return {
    title: text(form?.title),
    contactReason: {
      ...mapField(form?.contactReason, true),
      options: mapReasonOptions(form?.contactReason?.options),
    },
    fullName: mapField(form?.fullName, true),
    email: mapField(form?.email, true),
    phone: mapField(form?.phone, false),
    message: mapField(form?.message, true),
    submit: text(form?.submit),
  };
}

function mapOffice(
  office: NonNullable<NonNullable<CmsContactConfig['offices']>['locations']>[number]
): ContactOfficeView | null {
  const countryCode = text(office.countryCode);
  if (!countryCode) return null;

  return {
    countryCode,
    tab: text(office.tab) || countryCode,
    name: text(office.name),
    address: text(office.address),
    phones: (office.phones ?? []).map(text).filter(Boolean),
    fax: text(office.fax) || undefined,
    email: text(office.email),
    mapEmbed: text(office.mapEmbed),
  };
}

function mapOfficesFromArray(
  locations?: NonNullable<CmsContactConfig['offices']>['locations']
): ContactOfficeView[] {
  return (locations ?? [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(mapOffice)
    .filter((office): office is ContactOfficeView => office !== null);
}

function mapContactPage(config: CmsContactConfig): ContactPage {
  return {
    title: text(config.title),
    subtitle: text(config.subtitle),
    description: text(config.description),
    email: text(config.email),
    phone: text(config.phone),
    form: mapForm(config.form),
    officesTitle: text(config.offices?.title),
    offices: mapOfficesFromArray(config.offices?.locations),
    map: {
      title: text(config.map?.title),
      description: text(config.map?.description),
    },
  };
}

export async function getContactConfig(locale: string = 'es'): Promise<CmsContactConfig | null> {
  const response = await cmsClient.get<ContactListResponse>(
    'v1/contact',
    withSiteFilter({
      page: 1,
      pageSize: 20,
      languageCode: locale,
    })
  );

  const items = response.data ?? [];
  const item = items[0] ?? null;

  if (!item) {
    console.log(`[CMS] Sin contact para ${locale} (site=${cmsConfig.siteId}). Recibidos: ${items.length}`);
    return null;
  }

  console.log(
    `[CMS] Contact "${item.title ?? item.id}" con ${item.offices?.locations?.length ?? 0} oficinas`
  );
  return item;
}

export async function getContactPage(locale: string): Promise<ContactPage | null> {
  try {
    const config = await getContactConfig(locale);
    if (!config) return null;

    return mapContactPage(config);
  } catch (error) {
    console.error('[CMS] Error al obtener contact:', error);
    return null;
  }
}
