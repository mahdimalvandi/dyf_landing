package dashboard

func (response *DashboardResponse) EnsureNonNil() {
	if response.RecentLinks == nil {
		response.RecentLinks = make([]RecentLinkItem, 0)
	}
	if response.RecentCustomers == nil {
		response.RecentCustomers = make([]RecentCustomerItem, 0)
	}
}
