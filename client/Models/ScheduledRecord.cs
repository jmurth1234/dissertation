using Camera_Client.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

#pragma warning disable IDE1006 // Naming Styles

namespace Camera_Client.Models
{
    public class ScheduledRecord : BasePropertyItem
    {
        public string _id { get; set; }

        private int _startHour;
        public int startHour
        {
            get => _startHour;
            set => Set(ref _startHour, value);
        }

        private int _startMinute;
        public int startMinute
        {
            get => _startMinute;
            set => Set(ref _startMinute, value);
        }

        private int _endHour;
        public int endHour
        {
            get => _endHour;
            set => Set(ref _endHour, value);
        }

        private int _endMinute;
        public int endMinute
        {
            get => _endMinute;
            set => Set(ref _endMinute, value);
        }

        public List<DayOfWeek> daysRunning { get; set; } = new List<DayOfWeek>();

        private int _runEvery;
        public int runEvery
        {
            get => _runEvery;
            set => Set(ref _runEvery, value);
        }

        private int _runFor;
        public int runFor
        {
            get => _runFor;
            set => Set(ref _runFor, value);
        }

        private int _priority;
        public int priority
        {
            get => _priority;
            set => Set(ref _priority, value);
        }

        private int _framerate;
        public int framerate
        {
            get => _framerate;
            set => Set(ref _framerate, value);
        }

        private int _motionAccuracy;
        public int motionAccuracy
        {
            get => _motionAccuracy;
            set => Set(ref _motionAccuracy, value);
        }

        private int _motionSensitivity;
        public int motionSensitivity
        {
            get => _motionSensitivity;
            set => Set(ref _motionSensitivity, value);
        }

        private bool _alwaysUpload;
        public bool alwaysUpload
        {
            get => _alwaysUpload;
            set => Set(ref _alwaysUpload, value);
        }

        private string _comment;
        public string comment
        {
            get => _comment;
            set => Set(ref _comment, value);
        }

        public override string ToString()
        {
            var currentDays = daysRunning.Distinct().ToList();
            currentDays.Sort();
            var days = string.Join(", ", currentDays);
            return string.Format("{0:d2}:{1:d2} -- {2:d2}:{3:d2} {4}. {5}", startHour, startMinute, endHour, endMinute, days, comment);
        }
    }
}
