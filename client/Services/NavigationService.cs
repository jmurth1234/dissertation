using Camera_Client.Pages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;

namespace Camera_Client.Services
{
    class NavigationService
    {
        public static void NavigateTo(Type viewType, object param)
        {
            var homePage = Window.Current.Content as MainPage;
            homePage.CurrentFrame.Navigate(viewType, param);
        }

        public  static void NavigateBack()
        {
            var homePage = Window.Current.Content as MainPage;
            homePage.CurrentFrame.GoBack();
        }

        internal static void Blank()
        {
            var homePage = Window.Current.Content as MainPage;
            homePage.CurrentFrame.Navigate(typeof(Page));
        }
    }
}
