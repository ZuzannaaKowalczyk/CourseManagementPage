namespace WebApiService.Models
{
    public class Course
    {
        public int CourseID { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public DateTime CourseDateTime { get; set; }

        public ICollection<Registration>? Registrations { get; set; }
    }
}
