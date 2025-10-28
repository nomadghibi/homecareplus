// ... keep existing code (imports) ...

const navigationItems = [
  // ... keep existing code ...
];

// Helper component for Notification System with Medication Alerts
const NotificationCenter = ({ caregivers, visits, evvEvents, claims, clients, medications }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications = [];
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Medication dose reminders (next 30 minutes)
      if (medications) {
        const upcomingDoses = medications
          .filter(med => med.status === 'active')
          .reduce((acc, med) => {
            if (med.schedule_times && med.schedule_times.length > 0) {
              med.schedule_times.forEach(time => {
                const [hours, minutes] = time.split(':').map(Number);
                const doseTime = new Date();
                doseTime.setHours(hours, minutes, 0, 0);
                
                const diffMinutes = (doseTime - now) / (1000 * 60);
                
                if (diffMinutes > 0 && diffMinutes <= 30) {
                  acc++;
                }
              });
            }
            return acc;
          }, 0);

        if (upcomingDoses > 0) {
          newNotifications.push({
            id: 'medication_doses',
            type: 'Medication Due',
            message: `${upcomingDoses} dose${upcomingDoses > 1 ? 's' : ''} due in the next 30 minutes`,
            count: upcomingDoses,
            url: createPageUrl("Medications"),
            priority: 'high'
          });
        }

        // Medication refill alerts
        const needsRefill = medications.filter(med => {
          if (med.status !== 'active') return false;
          const quantity = med.refill_quantity || 0;
          const threshold = med.refill_threshold || 7;
          return quantity <= threshold || quantity === 0;
        }).length;

        if (needsRefill > 0) {
          newNotifications.push({
            id: 'medication_refills',
            type: 'Refill Needed',
            message: `${needsRefill} medication${needsRefill > 1 ? 's' : ''} need refill attention`,
            count: needsRefill,
            url: createPageUrl("Medications"),
            priority: 'medium'
          });
        }
      }

      // ... keep existing code (caregiver approvals) ...
      const pendingCaregivers = caregivers.filter(c => c.status === 'pending' || c.status === 'awaiting_approval');
      if (pendingCaregivers.length > 0) {
        newNotifications.push({
          id: 'caregiver_approval',
          type: 'Caregiver Approval',
          message: `${pendingCaregivers.length} caregiver${pendingCaregivers.length > 1 ? 's' : ''} awaiting approval.`,
          count: pendingCaregivers.length,
          url: createPageUrl("Caregivers"),
          priority: 'medium'
        });
      }

      // ... keep existing code (unconfirmed visits) ...
      const unconfirmedVisits = visits.filter(v => v.status === 'unconfirmed');
      if (unconfirmedVisits.length > 0) {
        newNotifications.push({
          id: 'unconfirmed_visits',
          type: 'Unconfirmed Visits',
          message: `${unconfirmedVisits.length} visit${unconfirmedVisits.length > 1 ? 's' : ''} require confirmation.`,
          count: unconfirmedVisits.length,
          url: createPageUrl("Schedule"),
          priority: 'medium'
        });
      }

      // ... keep existing code (EVV discrepancies) ...
      const evvDiscrepancies = evvEvents.filter(e => e.status === 'discrepancy');
      if (evvDiscrepancies.length > 0) {
        newNotifications.push({
          id: 'evv_discrepancies',
          type: 'EVV Discrepancy',
          message: `${evvDiscrepancies.length} EVV discrepancy${evvDiscrepancies.length > 1 ? 's' : ''} detected.`,
          count: evvDiscrepancies.length,
          url: createPageUrl("EVV"),
          priority: 'high'
        });
      }

      // ... keep existing code (pending claims) ...
      const pendingClaims = claims.filter(c => c.status === 'pending');
      if (pendingClaims.length > 0) {
        newNotifications.push({
          id: 'pending_claims',
          type: 'Pending Claims',
          message: `${pendingClaims.length} claim${pendingClaims.length > 1 ? 's' : ''} are pending processing.`,
          count: pendingClaims.length,
          url: createPageUrl("Billing"),
          priority: 'medium'
        });
      }

      // ... keep existing code (new clients) ...
      const newClients = clients.filter(cl => cl.status === 'new_enrollment');
      if (newClients.length > 0) {
        newNotifications.push({
          id: 'new_clients',
          type: 'New Client Enrollment',
          message: `${newClients.length} new client${newClients.length > 1 ? 's' : ''} require onboarding.`,
          count: newClients.length,
          url: createPageUrl("Clients"),
          priority: 'medium'
        });
      }

      // Sort by priority
      newNotifications.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      setNotifications(newNotifications);
    };

    // Only generate if data is available
    if (caregivers && visits && evvEvents && claims && clients && medications) {
      generateNotifications();
    }
  }, [caregivers, visits, evvEvents, claims, clients, medications]);

  const totalNotifications = useMemo(() => notifications.reduce((sum, notif) => sum + notif.count, 0), [notifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
          <Bell className="w-5 h-5 text-slate-600" />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {totalNotifications}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-4 py-2 text-sm font-semibold text-slate-700 border-b border-slate-100">
          Notifications ({totalNotifications})
        </div>
        {notifications.length === 0 ? (
          <div className="px-4 py-3 text-sm text-slate-500">No new notifications.</div>
        ) : (
          notifications.map(notif => (
            <DropdownMenuItem key={notif.id} asChild>
              <Link to={notif.url} className="flex items-center justify-between text-sm py-2 px-4 hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  {notif.priority === 'high' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  <div>
                    <p className="font-medium text-slate-700">{notif.type}</p>
                    <p className="text-xs text-slate-500">{notif.message}</p>
                  </div>
                </div>
                <Badge className="ml-2" variant={notif.priority === 'high' ? 'destructive' : 'secondary'}>
                  {notif.count}
                </Badge>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function Layout({ children, currentPageName }) {
  // ... keep existing code ...

  const queryEnabled = currentPageName !== "Landing" && !currentPageName?.startsWith("Family");

  // ... keep existing code (caregivers, visits, evvEvents, claims, clients queries) ...

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.MedicationSchedule.list(),
    enabled: queryEnabled
  });

  // ... keep existing code until notification center ...

              <div className="flex items-center gap-3">
                <NotificationCenter
                  caregivers={caregivers}
                  visits={visits}
                  evvEvents={evvEvents}
                  claims={claims}
                  clients={clients}
                  medications={medications}
                />
              </div>

            {/* ... keep existing code ... */}