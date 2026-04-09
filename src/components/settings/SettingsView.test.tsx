import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../ui/Toast';
import SettingsView from './SettingsView';

vi.mock('../../lib/api', () => ({
  ensureOrganizationId: vi.fn().mockResolvedValue('org-1'),
  getOrganization: vi.fn().mockResolvedValue({
    id: 'org-1',
    name: 'IntervieHire',
    contact_email: 'admin@interviehire.ai',
    description: 'Hiring platform',
  }),
  getPreferences: vi.fn().mockResolvedValue({
    id: 'pref-1',
    organization: 'org-1',
    cookie_settings: { analytics: true, marketing: false },
    updated_at: '2026-04-06',
  }),
  updateOrganization: vi.fn().mockResolvedValue({ id: 'org-1' }),
  updatePreferences: vi.fn().mockResolvedValue({ id: 'pref-1' }),
}));

import { updateOrganization, updatePreferences } from '../../lib/api';

describe('SettingsView', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saves profile changes and cookie preferences through API', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <SettingsView />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('IntervieHire')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(updateOrganization).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole('button', { name: 'Data & Privacy' }));

    const manageCookiesButton = await screen.findByRole('button', { name: /manage cookies/i });
    await user.click(manageCookiesButton);
    await user.click(screen.getByRole('button', { name: /save preferences/i }));

    await waitFor(() => {
      expect(updatePreferences).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error toast when profile save fails', async () => {
    const user = userEvent.setup();
    vi.mocked(updateOrganization).mockRejectedValueOnce(new Error('boom'));

    render(
      <ToastProvider>
        <SettingsView />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('IntervieHire')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save profile settings.')).toBeInTheDocument();
    });
  });

  it('shows error toast when cookie preference save fails', async () => {
    const user = userEvent.setup();
    vi.mocked(updatePreferences).mockRejectedValueOnce(new Error('boom'));

    render(
      <ToastProvider>
        <SettingsView />
      </ToastProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Data & Privacy' }));
    await user.click(await screen.findByRole('button', { name: /manage cookies/i }));
    await user.click(screen.getByRole('button', { name: /save preferences/i }));

    await waitFor(() => {
      expect(screen.getByText('Unable to save cookie preferences.')).toBeInTheDocument();
    });
  });
});
