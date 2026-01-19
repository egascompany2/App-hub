// import { Sidebar } from './components/Sidebar';
// import { Header } from './components/Header';
// import { StatCard } from './components/StatCard';
// import { useMobileMenu } from './hooks/useMobileMenu';

// function App() {
//   const { isOpen, toggle, close } = useMobileMenu();

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Sidebar isOpen={isOpen} onClose={close} />
//       <Header onMenuClick={toggle} />
      
//       <main className="lg:pl-64 pt-16">
//         <div className="p-4 lg:p-6">
//           <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
          
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
//             <StatCard title="Total Orders" value="112" />
//             <StatCard title="Active Orders" value="12" />
//             <StatCard title="Completed Orders" value="46" />
//             <StatCard title="Canceled Orders" value="6" />
//           </div>
          
//           {/* <OrdersTable /> */}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default App;