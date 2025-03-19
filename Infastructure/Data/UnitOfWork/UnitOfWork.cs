﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Infrastructure.Data.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private IDbContextTransaction? _currentTransaction;

        public UnitOfWork(AppDbContext context,
            IUserRepository userRepository,
            IPostRepository postRepository,
            IEmailTokenRepository emailTokenRepository,
            ILikeRepository likeRepository,
            IRefreshtokenRepository refreshtokenRepository,
            IShareRepository shareRepository,
            ICommentRepository commentRepository
            )
        {
            _context = context;
            UserRepository = userRepository;
            PostRepository = postRepository;
            EmailTokenRepository = emailTokenRepository;
            LikeRepository = likeRepository;
            RefreshtokenRepository = refreshtokenRepository;
            ShareRepository = shareRepository;
            CommentRepository = commentRepository;
        }
        public IUserRepository UserRepository { get; }
        public IPostRepository PostRepository { get; }
        public IEmailTokenRepository EmailTokenRepository { get; }
        public ILikeRepository LikeRepository { get; }
        public IRefreshtokenRepository RefreshtokenRepository { get; }
        public IShareRepository ShareRepository { get; }
        public ICommentRepository CommentRepository { get; }

        public async Task<int> SaveChangesAsync()
        => await _context.SaveChangesAsync();

        public async Task BeginTransactionAsync()
        {
            if (_currentTransaction != null)
                return; // Nếu đã có transaction thì không mở mới

            _currentTransaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            if (_currentTransaction == null)
                throw new InvalidOperationException("Không có transaction nào đang chạy.");

            await _currentTransaction.CommitAsync();
            await _currentTransaction.DisposeAsync();
            _currentTransaction = null;
        }

        public async Task RollbackTransactionAsync()
        {
            if (_currentTransaction == null)
                throw new InvalidOperationException("Không có transaction nào để rollback.");

            await _currentTransaction.RollbackAsync();
            await _currentTransaction.DisposeAsync();
            _currentTransaction = null;
        }

        public void Dispose()
        {
            _currentTransaction?.Dispose();
            _context.Dispose();
        }
    }
}
