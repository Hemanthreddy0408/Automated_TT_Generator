import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { changeAdminPassword } from '@/lib/api';
import { toast } from 'sonner';

const AdminSettings: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            await changeAdminPassword({
                currentPassword,
                newPassword,
                confirmPassword
            });
            toast.success('Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to update password';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            title="Account Settings"
            subtitle="Manage your administrative credentials and security preferences"
        >
            <div className="max-w-2xl space-y-6">
                <Card className="border-primary/10 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            Security Configuration
                        </CardTitle>
                        <CardDescription>
                            Update your administrative password. Ensure you use a strong, unique password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current">Current Password</Label>
                                <Input
                                    id="current"
                                    type="password"
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new">New Password</Label>
                                    <Input
                                        id="new"
                                        type="password"
                                        placeholder="Min. 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm">Confirm New Password</Label>
                                    <Input
                                        id="confirm"
                                        type="password"
                                        placeholder="Repeat new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-between">
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Security action: This will invalidate your previous password.
                                </div>
                                <Button type="submit" disabled={loading} className="gap-2">
                                    {loading ? 'Updating...' : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Update Password
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="bg-muted/30 border-dashed">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Security Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 pb-4">
                        <p className="text-xs text-muted-foreground">
                            Two-factor authentication (OTP) is currently enabled for all administrative logins and cannot be disabled.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
