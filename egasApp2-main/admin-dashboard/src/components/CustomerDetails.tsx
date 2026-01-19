import { useQuery, useMutation } from "@tanstack/react-query";
import { customersService } from "../services/customers";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "./ui/separator";
import { CustomerOrdersTab } from "./CustomerOrdersTab";
import { CustomerDetails as CustomerDetailsType } from "@/types/customer";
import SkeletonWrapper from "./SkeletonWrapper";

const activityStatus ={
  PENDING: "Placed An Order",
  CANCELLED: "Cancelled An Order",
  DELIVERED: "Received An Order",
  ASSIGNED: "Assigned An Order",
}

export function CustomerDetails({ userId }: { userId: string }) {
  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", userId],
    queryFn: () => customersService.getCustomerDetails(userId),
  });

  const contactMutation = useMutation({
    mutationFn: () => customersService.contactCustomer(userId),
    onSuccess: () => {
      toast.success("Message sent to customer");
    },
  });


  const formattedCustomer = customer as CustomerDetailsType;

  const handleContact = () => {
    contactMutation.mutate();
  };

  return (
    <div className="flex justify-between">
      <div className="w-[700px] gap-8 mx-auto">
        <SkeletonWrapper isLoading={isLoading}>
      <h3 className="text-[22px] text-[#080D1C] font-semibold">
          {formattedCustomer?.name}
        </h3>
        </SkeletonWrapper>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger className="text-[12px] bg-transparent" value="overview">
              Overview
            </TabsTrigger>
            <TabsTrigger className="text-[12px] bg-transparent" value="orders">
              Orders
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="space-y-6 mt-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <SkeletonWrapper isLoading={isLoading}>
                <div className="bg-white border border-[#BABABA] p-6 rounded-lg">
                <p className="text-[#000000]">Total Orders</p>
                  <p className="text-[32px] font-semibold">
                    {formattedCustomer?.stats.totalOrders}
                  </p>
                  
                </div>
                </SkeletonWrapper>
                <SkeletonWrapper isLoading={isLoading}>
                <div className="bg-white border border-[#BABABA] p-6 rounded-lg">
                  <p className="text-[#000000]">Completed Orders</p>
                  <p className="text-[32px] font-semibold">
                    {formattedCustomer?.stats.completedOrders}
                  </p>
                
                </div>
                </SkeletonWrapper>
                <SkeletonWrapper isLoading={isLoading}>
                <div className="bg-white border border-[#BABABA] p-6 rounded-lg">
                  <p className="text-[#000000]">Canceled Orders</p>
                  <p className="text-[32px] font-semibold">
                    {formattedCustomer?.stats.cancelledOrders}
                  </p>
                  
                </div>
                </SkeletonWrapper>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Recent activity</h2>
                
                <div className="space-y-6">
                  {formattedCustomer?.recentActivity.map((activity, index) => (
                    <SkeletonWrapper isLoading={isLoading}>
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="text-[#080D1C] text-[16px]">
                          {format(new Date(activity.date), "MMM dd yyyy")}
                        </p>
                        <p className="text-[#080D1C] text-[12px]">{activityStatus[activity.action as keyof typeof activityStatus]}</p>
                      </div>
                      <p className="text-[#080D1C] text-[16px]">
                        {format(new Date(activity.time), "hh:mm a")}
                      </p>
                    </div>
                    </SkeletonWrapper>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="orders">
            <CustomerOrdersTab userId={userId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Side bar */}
      <div className="flex w-[286px] min-h-screen flex-col bg-white items-end gap-2">
        <SkeletonWrapper isLoading={isLoading}>
        <div className="flex flex-col justify-center items-center gap-4 p-6">
          <h1 className="text-2xl font-semibold">{formattedCustomer?.name}</h1>
          <p className="text-[#000000] text-[12px]">User ID: {formattedCustomer?.id}</p>
          <span
            className={`px-3 py-1 rounded-full ${
              formattedCustomer?.isActive ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
          >
            {formattedCustomer?.isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={handleContact}
            className="mt-2 bg-black text-white px-4 py-2 rounded-lg"
          >
            Contact customer
          </button>
        </div>
        </SkeletonWrapper>
        <Separator className="w-full my-4" />

        {/* Customer Info */}
        <div className="flex flex-col gap-8 p-6">
          <SkeletonWrapper isLoading={isLoading}>
          <div>
            <h2 className="font-semibold mb-2">Current Delivery Address</h2>
            <p>{formattedCustomer?.currentAddress}</p>
          </div>
          </SkeletonWrapper>
          <SkeletonWrapper isLoading={isLoading}>
          <div>
            <h2 className="font-semibold mb-2">Phone NO</h2>
            <p>{formattedCustomer?.phoneNumber}</p>
          </div>
          </SkeletonWrapper>
          <SkeletonWrapper isLoading={isLoading}>
          <div>
            <h2 className="font-semibold mb-2">Gas size</h2>
            <p>{formattedCustomer?.gasSize}</p>
          </div>
          </SkeletonWrapper>
        </div>
      </div>
    </div>
  );
}
