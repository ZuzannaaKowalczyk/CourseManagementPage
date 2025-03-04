using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApiService.Data;
using WebApiService.Models;

namespace WebApiService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegistrationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RegistrationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Registrations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Registration>>> GetRegistrations()
        {
            return await _context.Registrations
                .Include(r => r.Course)
                .Include(r => r.Student)
                .ToListAsync();
        }

        // GET: api/Registrations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Registration>> GetRegistration(int id)
        {
            var registration = await _context.Registrations
                .Include(r => r.Course)
                .Include(r => r.Student)
                .FirstOrDefaultAsync(m => m.RegistrationID == id);

            if (registration == null)
            {
                return NotFound();
            }

            return registration;
        }

        [HttpGet("Course/{courseId}")]
        public async Task<ActionResult<IEnumerable<Student>>> GetStudentsByCourse(int courseId)
        {
            var students = await _context.Registrations
                .Where(r => r.CourseID == courseId)
                .Include(r => r.Student)
                .Select(r => r.Student)
                .ToListAsync();

            if (students == null || !students.Any())
            {
                return NotFound("No students found for this course.");
            }

            return Ok(students);
        }

        // GET: api/Registrations/user?email=example@example.com
        [HttpGet("user")]
        public async Task<ActionResult<IEnumerable<object>>> GetCoursesByUserEmail([FromQuery] string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email is required.");
            }

            // Pobieranie kursów na podstawie adresu e-mail użytkownika
            var courses = await _context.Registrations
                .Include(r => r.Student)
                .Include(r => r.Course)
                .Where(r => r.Student != null && r.Student.Email == email)
                .Where(r => r.Course != null)
                .Select(r => new
                {
                    CourseName = r.Course!.CourseName,
                    CourseDateTime = r.Course.CourseDateTime
                })
                .ToListAsync();

            if (courses == null || courses.Count == 0)
            {
                return NotFound("No courses found for the provided email.");
            }

            return Ok(courses);
        }

        // POST: api/Registrations
        [HttpPost]
        public async Task<ActionResult<Registration>> PostRegistration(RegistrationDto registrationDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Sprawdź, czy uczestnik już istnieje w tabeli Students
                var existingStudent = await _context.Students
                    .FirstOrDefaultAsync(s =>
                        s.FirstName == registrationDto.FirstName &&
                        s.LastName == registrationDto.LastName &&
                        s.Email == registrationDto.Email);

                int studentId;


                if (existingStudent != null)
                {
                    // Jeśli uczestnik istnieje, pobierz jego ID
                    studentId = existingStudent.StudentID;
                }
                else
                {

                    if (registrationDto.FirstName == null || registrationDto.LastName == null || registrationDto.Email == null)
                    {
                        return BadRequest("FirstName, LastName, and Email are required.");
                    }

                    // Jeśli uczestnik nie istnieje, dodaj go do tabeli Students
                    var newStudent = new Student
                    {
                        FirstName = registrationDto.FirstName,
                        LastName = registrationDto.LastName,
                        Email = registrationDto.Email,
                        Age = registrationDto.Age
                    };

                    _context.Students.Add(newStudent);
                    await _context.SaveChangesAsync();
                    studentId = newStudent.StudentID;
                }

                // Sprawdź, czy rejestracja na kurs już istnieje
                var existingRegistration = await _context.Registrations
                    .FirstOrDefaultAsync(r => r.StudentID == studentId && r.CourseID == registrationDto.CourseID);


                if (existingRegistration != null)
                {
                    return Conflict("Jesteś już zarejestrowany na ten kurs");
                }

                // Dodaj rejestrację do tabeli Registrations
                var registration = new Registration
                {
                    StudentID = studentId,
                    CourseID = registrationDto.CourseID,
                    RegistrationDate = DateTime.Now
                };
                _context.Registrations.Add(registration);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return CreatedAtAction(nameof(PostRegistration), new { id = registration.RegistrationID }, registration);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "Internal server error.");
            }
        }

        // PUT: api/Registrations/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRegistration(int id, Registration registration)
        {
            if (id != registration.RegistrationID)
            {
                return BadRequest();
            }

            _context.Entry(registration).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RegistrationExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        private bool RegistrationExists(int id)
        {
            return _context.Registrations.Any(e => e.RegistrationID == id);
        }

        // DELETE: api/Registrations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRegistration(int id)
        {
            var registration = await _context.Registrations.FindAsync(id);
            if (registration == null)
            {
                return NotFound();
            }

            _context.Registrations.Remove(registration);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        // DELETE: api/Registrations?courseId=5&email=example@example.com
        [HttpDelete]
        public async Task<IActionResult> DeleteRegistrationByCourseAndEmail([FromQuery] int courseId, [FromQuery] string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email is required.");
            }

            try
            {
                // Znajdź rejestrację na podstawie ID kursu i adresu e-mail
                var registration = await _context.Registrations
                    .Include(r => r.Student)
                    .Where(r => r.CourseID == courseId && r.Student != null && r.Student.Email == email)
                    .FirstOrDefaultAsync();

                if (registration == null)
                {
                    return NotFound("Registration not found for the provided course and email.");
                }

                _context.Registrations.Remove(registration);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "Internal server error.");
            }
        }
    }
}
