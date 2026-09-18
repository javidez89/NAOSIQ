import tokens from './naosiq-tokens.json';

/** Visible identity from NAOSIQ V6; technical identifiers keep their existing names. */
export const brand = {
  name: tokens.brand.name,
  slogan: tokens.brand.tagline,
  endorsement: tokens.brand.endorsement,
  status: 'approved-name-pending-master-logo' as const,
};
