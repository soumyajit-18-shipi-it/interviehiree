import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../ui/Toast';
import TeamManagement from './TeamManagement';

const teamMembers = [
  {
    id: 'tm-1',
    user: '1',
    username: 'sarah.connor',
    organization: 'org-1',
    first_name: 'Sarah',
    last_name: 'Connor',
    display_name: 'Sarah Connor',
    email: 'sarah@example.com',
    designation: 'Head of Talent',
    user_type: 'org_admin',
    status: 'active',
  },
  {
    id: 'tm-2',
    user: '2',
    username: 'rita.recruiter',
    organization: 'org-1',
    first_name: 'Rita',
    last_name: 'Recruiter',
    display_name: 'Rita Recruiter',
    email: 'rita@example.com',
    designation: 'Recruiter',
    user_type: 'recruiter',
    status: 'invited',
  },
] as const;

vi.mock('../../lib/api', () => ({
  ensureOrganizationId: vi.fn().mockResolvedValue('org-1'),
  listTeam: vi.fn(),
  getTeamMember: vi.fn(),
  listJobs: vi.fn(),
  createTeamMember: vi.fn(),
  updateTeamMember: vi.fn(),
  deleteTeamMember: vi.fn(),
}));

import {
  createTeamMember,
  deleteTeamMember,
  getTeamMember,
  listJobs,
  listTeam,
  updateTeamMember,
} from '../../lib/api';

describe('TeamManagement', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(listTeam).mockResolvedValue({
      count: teamMembers.length,
      next: null,
      previous: null,
      results: [...teamMembers],
    });

    vi.mocked(listJobs).mockImplementation(async (params: { created_by?: string }) => ({
      count: params.created_by === '1' ? 4 : 2,
      next: null,
      previous: null,
      results: [],
    }));

    vi.mocked(getTeamMember).mockImplementation(async (memberId: string) => {
      const member = teamMembers.find((item) => item.id === memberId) ?? teamMembers[0];
      return { ...member } as never;
    });

    vi.mocked(createTeamMember).mockResolvedValue({ id: 'tm-3' } as never);
    vi.mocked(updateTeamMember).mockResolvedValue({ id: 'tm-1' } as never);
    vi.mocked(deleteTeamMember).mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads team members and shows summary counts', async () => {
    render(
      <ToastProvider>
        <TeamManagement />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sarah Connor')).toBeDefined();
      expect(screen.getByText('Rita Recruiter')).toBeDefined();
    });

    expect(screen.getByText('Team Members')).toBeDefined();
    expect(screen.getByText('Total Members')).toBeDefined();
    expect(screen.getByText('Admins')).toBeDefined();
    expect(screen.getByText('Active Members')).toBeDefined();
    expect(screen.getByText('Pending Invites')).toBeDefined();
    expect(listJobs).toHaveBeenCalledTimes(2);
  });

  it('sends a team invite via the API', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <TeamManagement />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sarah Connor')).toBeDefined();
    });

    await user.click(screen.getByRole('button', { name: /invite member/i }));
    await user.type(screen.getByLabelText(/full name/i), 'New User');
    await user.type(screen.getByLabelText(/email address/i), 'newuser@example.com');
    await user.click(screen.getByRole('button', { name: /send invite/i }));

    await waitFor(() => {
      expect(createTeamMember).toHaveBeenCalledTimes(1);
    });

    expect(createTeamMember).toHaveBeenCalledWith(
      expect.objectContaining({
        organization: 'org-1',
        username: 'newuser',
        email: 'newuser@example.com',
        first_name: 'New',
        last_name: 'User',
        designation: 'Recruiter',
        user_type: 'recruiter',
        status: 'invited',
      })
    );
  });

  it('edits a team member through the actions menu', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <TeamManagement />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sarah Connor')).toBeDefined();
    });

    await user.click(screen.getByRole('button', { name: /open actions for sarah connor/i }));
    await user.click(screen.getByRole('button', { name: /edit member/i }));

    const designationInput = screen.getByLabelText(/designation/i);
    await user.clear(designationInput);
    await user.type(designationInput, 'Senior Recruiter');

    const statusSelect = screen.getByLabelText(/status/i);
    await user.selectOptions(statusSelect, 'inactive');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(updateTeamMember).toHaveBeenCalledWith('tm-1', {
        designation: 'Senior Recruiter',
        status: 'inactive',
      });
    });
  });

  it('deletes a team member through the actions menu', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <TeamManagement />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Rita Recruiter')).toBeDefined();
    });

    await user.click(screen.getByRole('button', { name: /open actions for rita recruiter/i }));
    await user.click(screen.getByRole('button', { name: /delete member/i }));
    await user.click(screen.getByRole('button', { name: /delete member/i }));

    await waitFor(() => {
      expect(deleteTeamMember).toHaveBeenCalledWith('tm-2');
    });
  });

  it('filters the visible team members with search', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <TeamManagement />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sarah Connor')).toBeDefined();
    });

    await user.type(screen.getByPlaceholderText(/search team, role, email/i), 'rita');

    expect(screen.queryByText('Sarah Connor')).toBeNull();
    expect(screen.getByText('Rita Recruiter')).toBeDefined();
  });

  it('shows an error state when loading fails', async () => {
    vi.mocked(listTeam).mockRejectedValueOnce(new Error('load-failed'));

    render(
      <ToastProvider>
        <TeamManagement />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Unable to load team members.').length).toBeGreaterThan(0);
    });
  });
});