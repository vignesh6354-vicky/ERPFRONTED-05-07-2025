import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleString();
};


export const generateColors = (count) => {
  const colors = [];

  for (let i = 0; i < count; i++) {
    const hue = Math.round((360 / count) * i); // Spread hues evenly around the color wheel
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }

  return colors;
};


export const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
export const hasPermission = (featurePermissions, featureName, action) => {
  const feature = featurePermissions.find(f => f.feature === featureName);
  return feature?.permissions?.[action] === true;
};

export const hasAuthority = (authorities, value) => {
  return authorities?.includes(value);
};

export const filterSidebarItems = (sidebarItems, featurePermissions, role, authorities) => {
  const isAdmin = role === 'ADMIN';
  const isStaff = authorities?.includes("TYPE_STAFF");


  return sidebarItems
    .map(item => {
      if (item.permission) {
        const allowed = isAdmin || hasPermission(featurePermissions, item.permission.module, item.permission.action);
        console.log(`${allowed ? '✅' : '❌'} ${item.text}`);
        return allowed ? item : null;
      }

      if (item.nestedItems) {
        item.nestedItems = item.nestedItems.filter(nestedItem => {
          
          const allowed = isAdmin || !nestedItem.permission || hasPermission(
            featurePermissions,
            nestedItem.permission.module,
            nestedItem.permission.action

          );
          if (nestedItem.tab === 'Timesheet' && !isStaff) return false;
          if (nestedItem.tab === 'overalltimesheet' && isStaff) return false;

          if (nestedItem.tab === 'shift' && isStaff) return false;
          if (nestedItem.tab === 'ShiftCategories' && isStaff) return false;
      
          console.log(`${allowed ? '✅' : '❌'} ${item.text} > ${nestedItem.text}`);
          return allowed;
        });

        if (item.nestedItems.length > 0) {
          console.log(`✅ ${item.text} (parent shown)`);
          return item;
        } else {
          console.log(`❌ ${item.text} (no visible nested items)`);
          return null;
        }
      }

      console.log(`✅ ${item.text} (no permission required)`);
      return item;
    })
    .filter(Boolean); // remove nulls
};
