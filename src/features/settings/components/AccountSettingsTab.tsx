
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const AccountSettingsTab = () => {
    const { logout } = useAuth();

    const handleLogoutAll = async () => {
        // For now, we reuse the regular logout since the current backend implementation 
        // invalidates the refresh token, which effectively logs out all sessions 
        // that share the same refresh token logic. 
        // If backend supports specific "Logout All Devices" endpoint in future, update here.
        await logout();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Account Settings</h2>
                <p className="text-muted-foreground mt-1">
                    Manage your account security and sessions
                </p>
            </div>

            <Card className="border-destructive/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-destructive" />
                        <CardTitle className="text-lg">Danger Zone</CardTitle>
                    </div>
                    <CardDescription>
                        Actions that affect your account access and security
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-destructive/5">
                        <div className="space-y-1">
                            <h3 className="font-medium">Logout Everywhere</h3>
                            <p className="text-sm text-muted-foreground">
                                Sign out from all devices and browsers immediately.
                            </p>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout All Devices
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action will sign you out from all devices, including this one.
                                        You will need to sign in again on every device you use.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleLogoutAll} className="bg-destructive hover:bg-destructive/90">
                                        Yes, Logout All
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
